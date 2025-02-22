import { ISocket } from "../types";
import { UserType } from "../types/enums";
import { Chat as ChatRepo, Message } from "./../repos";
import Handler from "./Handler";

export default class ChatHandler {

    private static chatRepo = new ChatRepo();
    private static message = new Message();

    public static joinChat(socket: ISocket) {
        return async (data: any) => {
            const { productId, sellerId, buyerId, userId } = data;

            const room = `chat_${productId}_${sellerId}_${buyerId}`
            console.log(`🟢 User ${userId} joining room: ${room}`)

            try {
                socket.join(room);
                console.log("Testing here");


                const repoResult = await this.chatRepo.getChatWithMessages({ productId, sellerId, buyerId });
                const repoResultError = Handler.handleRepoError(repoResult);
                if (repoResultError) {
                    socket.emit('appError', repoResultError);
                    return;
                }
                const chat = repoResult.data;

                if (chat) {

                    const messages = chat.messages;
                    if (messages.length != 0) {
                        const notSenderId = messages[0].senderId == sellerId ? buyerId : sellerId;

                        // Mark messages as read if the user is the recipient
                        const markMessagesAsReadResult = await this.message.markMessagesAsRead(chat.id, notSenderId);
                        const markMessagesAsReadResultError = Handler.handleRepoError(markMessagesAsReadResult);
                        if (markMessagesAsReadResultError) {
                            socket.emit('appError', markMessagesAsReadResultError);
                            return;
                        }

                        //Include the additional fields when sending the chat history
                        socket.emit('loadMessages', {
                            productImageUrl: chat.productImageUrl,
                            storeLogoUrl: chat.storeLogoUrl,
                            buyerImgUrl: chat.buyerImgUrl,
                            productPrice: chat.productPrice,
                            productName: chat.productName,
                            buyerName: chat.buyerName,
                            storeName: chat.storeName,
                            messages: chat.messages
                        });
                        socket.to(room).emit('updateReadReceipts', {
                            'message': chat
                        });
                    }
                } else {
                    console.log(`⚠️ No chat history found for room ${room}`)
                }
            } catch (error) {
                console.error(`❌ Error joining chat room ${room}:`, error);
                socket.emit('appError', {
                    error: true,
                    message: "Something went wrong",
                    code: 500
                });
            }
        }
    }

    public static sendMessage(socket: ISocket) {
        return async (data: any) => {
            console.log(data);

            const {
                productId,
                sellerId,
                buyerId,
                senderId,
                text,
                storeName,
                buyerName,
                storeLogoUrl,
                buyerImgUrl,
                productPrice,
                productName,
                productImageUrl
            } = data;

            const room = `chat_${productId}_${sellerId}_${buyerId}`;

            console.log(`📩 User ${senderId} sending message to room ${room}: "${text}"`);

            try {
                const repoResult = await this.chatRepo.getChatWithMessages({ productId, sellerId, buyerId });
                const repoResultError = Handler.handleRepoError(repoResult);
                if (repoResultError) return socket.emit('appError', repoResultError);

                let chat = repoResult.data;


                let newMessage;

                if (!chat) {
                    console.log(`💬 Creating new chat for room ${room}`);

                    const newChat = {
                        productId,
                        sellerId,
                        buyerId,
                        buyerImgUrl,
                        productPrice,
                        productName,
                        storeName,
                        buyerName,
                        storeLogoUrl,
                        productImageUrl,
                    };

                    // Create new chat with first message
                    const newChatResult = await this.chatRepo.insertChatWithMessage(newChat, { senderId, text });
                    const newChatResultError = Handler.handleRepoError(newChatResult);
                    console.log(newChatResultError);

                    if (newChatResultError) {
                        socket.emit('appError', newChatResultError);
                        return;
                    }


                    chat = newChatResult.data; // Get the newly created chat
                    newMessage = chat.messages[0]; // First message in the chat
                    console.log(newMessage);

                } else {
                    console.log(`🟡 Adding message to existing chat for room ${room}`);

                    newMessage = await this.message.insert({ senderId, text, chatId: chat.id });
                    const createMessageResultError = Handler.handleRepoError(newMessage);
                    if (createMessageResultError) {
                        socket.emit('appError', createMessageResultError);
                        return;
                    }
                }

                // Mark all existing messages as read except for the sender's own messages
                const markMessagesAsReadResult = await this.message.markMessagesAsRead(chat.id, senderId);
                const markMessagesAsReadResultError = Handler.handleRepoError(markMessagesAsReadResult);
                if (markMessagesAsReadResultError) {
                    socket.emit('appError', markMessagesAsReadResultError);
                    return;
                }

                // Emit new message event to the room
                socket.to(room).emit('receiveMessage', {
                    error: false,
                    data: newMessage,
                    statusCode: 200
                });
                console.log(`✅ Message sent successfully to room ${room}`);
            } catch (error) {
                console.error(`❌ Error sending message in room ${room}:`, error);

                socket.emit('appError', {
                    error: true,
                    message: "Something went wrong",
                    statusCode: 500
                });
            }
        }
    }

    public static markAsRead(socket: ISocket) {
        return async (data: any) => {
            const { productId, sellerId, buyerId, userId } = data;
            const room = `chat_${productId}_${sellerId}_${buyerId}`
            console.log(
                `👀 User ${userId} marking messages as read in room ${room}`
            )

            const repoResult = await this.chatRepo.getChatWithMessages({ productId, sellerId, buyerId });
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }
            const chat = repoResult.data;

            if (chat) {
                const messages = chat.messages;
                if (messages.length != 0) {
                    const notSenderId = messages[0].senderId == sellerId ? buyerId : sellerId;
                    // Mark messages as read if the user is the recipient
                    const markMessagesAsReadResult = await this.message.markMessagesAsRead(chat.id, notSenderId);
                    const markMessagesAsReadResultError = Handler.handleRepoError(markMessagesAsReadResult);
                    if (markMessagesAsReadResultError) {
                        socket.emit('appError', markMessagesAsReadResultError);
                        return;
                    }
                    socket.to(room).emit('updateReadReceipts', chat.messages)
                    console.log(`✅ Messages marked as read in room ${room}`)
                }
            } else {
                console.log(`⚠️ No chat found for room ${room} to mark as read`)
            }
        }
    }
    public static deleteMessage(socket: ISocket) {
        return async (data: any) => {
            const { productId, sellerId, buyerId, messageId } = data;
            const room = `chat_${productId}_${sellerId}_${buyerId}`;
            console.log(`🗑️ Deleting message ${messageId} in room ${room}`)

            const repoResult = await this.message.deleteWithId(messageId);
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }
            socket.to(room).emit('messageDeleted', messageId);// Emit message deletion event
            console.log(
                `✅ Message ${messageId} deleted successfully from room ${room}`
            );
        }
    }

    public static typing(socket: ISocket) {
        return async (data: any) => {
            const { productId, sellerId, buyerId, senderId } = data;

            const room = `chat_${productId}_${sellerId}_${buyerId}`
            console.log(`✍️ User ${senderId} is typing in room ${room}`)
            socket.to(room).emit('userTyping', senderId)
        }
    }

    public static getUserChats(socket: ISocket) {
        return async (data: any) => {
            const { userId, userType } = data;
            const message = "Chat has been sent successfully";

            if (userType == UserType.Customer) {
                const repoResult = await this.chatRepo.getBuyerChatsWithMessages(userId);
                const repoResultError = Handler.handleRepoError(repoResult);
                if (repoResultError) {
                    socket.emit('appError', repoResultError);
                    return;
                }

                socket.emit('userChats', Handler.responseData(200, false, message, repoResult.data));
            } else if (userType == UserType.Vendor) {
                const repoResult = await this.chatRepo.getSellerChatsWithMessages(userId);
                const repoResultError = Handler.handleRepoError(repoResult);
                if (repoResultError) {
                    socket.emit('appError', repoResultError);
                    return;
                }

                socket.emit('userChats', Handler.responseData(200, false, message, repoResult.data));
            } else {
                socket.emit('appError', Handler.responseData(400, true, "Invalid user type"))
            }
        }
    }

    public static disconnect(socket: ISocket) {
        return (data: any) => {
            console.log("User disconnected: ", socket.id);
        }
    }
}