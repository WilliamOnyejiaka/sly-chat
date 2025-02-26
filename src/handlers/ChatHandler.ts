import { Server } from "socket.io";
import { OnlineCustomer, OnlineVendor } from "../cache";
import { ISocket } from "../types";
import { Namespace, UserType } from "../types/enums";
import { Chat as ChatRepo, Message } from "./../repos";
import Handler from "./Handler";
import { v4 as uuidv4 } from 'uuid';
import { Chat } from "../services/sockets";

export default class ChatHandler {

    private static chatRepo = new ChatRepo();
    private static messageRepo = new Message();
    private static readonly onlineCustomer: OnlineCustomer = new OnlineCustomer();
    private static readonly onlineVendor: OnlineVendor = new OnlineVendor();
    private static readonly chatService = new Chat();

    private static async getRecipientOnlineStatus(userType: UserType, recipientId: string) {
        const recipientOnlineCache = await (userType === UserType.Customer
            ? ChatHandler.onlineVendor
            : ChatHandler.onlineCustomer).get(recipientId);
        return recipientOnlineCache?.data ? JSON.parse(recipientOnlineCache.data) : null;
    }

    private static async getUserOnlineStatus(userType: UserType, recipientId: string) {
        const recipientOnlineCache = await (userType === UserType.Vendor
            ? ChatHandler.onlineVendor
            : ChatHandler.onlineCustomer).get(recipientId);
        return recipientOnlineCache?.data ? JSON.parse(recipientOnlineCache.data) : null;
    }

    public static async onConnection(io: Server, socket: ISocket) {
        console.log("User connected: ", socket.id);
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;
        console.log(`User id ${userId} , user type ${userType}`);

        const onlineCacheUpdated = await ChatHandler.chatService.updateOnlineCache(userId, userType, socket);
        if (onlineCacheUpdated.error) {
            socket.emit('appError', onlineCacheUpdated);
            socket.disconnect(true);
            return;
        }

        const getUserChatsAndOfflineMessages = await ChatHandler.chatService.getUserChatsAndOfflineMessages(userId, userType);
        if (getUserChatsAndOfflineMessages.error) {
            socket.emit('appError', getUserChatsAndOfflineMessages);
            return;
        }

        console.log(getUserChatsAndOfflineMessages.data);


        const rooms = getUserChatsAndOfflineMessages.data.rooms;
        const offlineMessages = getUserChatsAndOfflineMessages.data.offlineMessages;
        const chat = getUserChatsAndOfflineMessages.data.chat;

        if (rooms) socket.join(rooms);

        io.of(Namespace.CHAT).to(rooms).emit("userIsOnline", Handler.responseData(200, false, "User is online"));
        socket.emit('offlineMessages', Handler.responseData(200, false, "Offline messages has been sent successfully", offlineMessages));
        socket.emit('userChats', Handler.responseData(200, false, "Chats have been sent successfully", chat));
    }

    public static async joinRooms(io: Server, socket: ISocket, data: any) {
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;
        const message = "Chats has been sent successfully";

        if (userType == UserType.Customer) {
            const repoResult = await this.chatRepo.getCustomerChatsWithMessages(userId);
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }

            const chat = repoResult.data;
            const rooms = chat.map((item: any) => item.id);
            socket.join(rooms);
            socket.emit('userChats', Handler.responseData(200, false, message, repoResult.data));
            return;
        } else if (userType == UserType.Vendor) {
            const repoResult = await this.chatRepo.getVendorChatsWithMessages(userId);
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }
            const chat = repoResult.data;
            const rooms = chat.map((item: any) => item.id);
            socket.join(rooms);
            socket.emit('userChats', Handler.responseData(200, false, message, chat));
            return;
        } else {
            socket.emit('appError', {
                error: true,
                message: "Unauthorized user",
                statusCode: 401
            });
            return;
        }
    }

    public static async joinChat(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.data.id;
        const userType = socket.locals.userType;

        const { recipientId, chatId } = data;

        console.log(`🟢 User ${userId} joining room: ${chatId}`)

        const repoResult = await this.chatRepo.getChatWithMessages({ id: chatId });
        const repoResultError = Handler.handleRepoError(repoResult);
        if (repoResultError) {
            socket.emit('appError', repoResultError);
            return;
        }
        const chat = repoResult.data;

        if (chat) {

            const messages = chat.messages;
            if (messages.length != 0) {
                const notSenderId = messages[0].senderId == userId ? recipientId : userId;

                // Mark messages as read if the user is the recipient
                const markMessagesAsReadResult = await this.messageRepo.markMessagesAsRead(chat.id, notSenderId);
                const markMessagesAsReadResultError = Handler.handleRepoError(markMessagesAsReadResult);
                if (markMessagesAsReadResultError) {
                    socket.emit('appError', markMessagesAsReadResultError);
                    return;
                }

                //Include the additional fields when sending the chat history
                socket.emit('loadMessages', Handler.responseData(200, false, "Chats has been loaded", chat));
                socket.to(chatId).emit('updateReadReceipts', Handler.responseData(200, false, "Chats has been updated"));
                return;
            }
        }
    }

    public static async sendMessage(io: Server, socket: ISocket, data: any) {
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;

        let {
            recipientId,
            productId,
            chatId,
            text,
            storeName,
            buyerName,
            storeLogoUrl,
            buyerImgUrl,
            productPrice,
            productName,
            productImageUrl
        } = data;

        if (!recipientId || !text) {
            socket.emit('appError', { error: true, message: "Invalid data provided", statusCode: 400 });
            return;
        }

        let buyerId, sellerId;
        if (userType == UserType.Customer) {
            sellerId = recipientId;
            buyerId = userId;
        } else if (userType == UserType.Vendor) {
            buyerId = recipientId;
            sellerId = userId;
        } else {
            socket.emit('appError', {
                error: true,
                message: "Unauthorized user",
                statusCode: 401
            });
            return;
        }

        const recipientOnlineData = await ChatHandler.getRecipientOnlineStatus(userType, recipientId);
        const recipientOnline = !!recipientOnlineData;

        let newMessage;
        let chat;
        if (!chatId) {
            console.log(`💬 Creating new chat for room `);

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
            const newChatResult = await ChatHandler.chatRepo.insertChatWithMessage(newChat, { senderId: userId, text, recipientOnline, senderType: userType });
            const newChatResultError = Handler.handleRepoError(newChatResult);

            if (newChatResultError) {
                socket.emit('appError', newChatResultError);
                return;
            }

            chat = newChatResult.data; // Get the newly created chat
            newMessage = chat.messages[0]; // First message in the chat
            socket.join(chatId);
            console.log(`New chat has been created`);

            if (recipientOnlineData) {
                const recipientSocketId = recipientOnlineData.chatSocketId;


                console.log('Online data: ', recipientOnlineData);

                socket.to(recipientSocketId).emit('newChat', { error: false, data: newMessage, statusCode: 200 });
                // presenceNamespace.to(recipientSocketId).emit('newChat', { error: false, data: newMessage, statusCode: 200 });
                console.log(`✅ Message sent directly to user ${recipientId} via socket ${recipientSocketId}`);
            }
        } else {
            console.log(`📩 User ${userId} sending message to room ${chatId}: "${text}"`);

            const repoResult = await ChatHandler.chatRepo.getChatWithMessages({ id: chatId });
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }

            console.log(`🟡 Adding message to existing chat for room ${chatId}`);
            chat = repoResult.data;
            if (chat) {
                newMessage = await ChatHandler.messageRepo.insert({ senderId: userId, text, chatId: chat.id, recipientOnline, senderType: userType });
                const createMessageResultError = Handler.handleRepoError(newMessage);
                if (createMessageResultError) {
                    socket.emit('appError', createMessageResultError);
                    return;
                }

                // Mark all existing messages as read except for the sender's own messages
                const markMessagesAsReadResult = await ChatHandler.messageRepo.markMessagesAsRead(chat.id, userId);
                const markMessagesAsReadResultError = Handler.handleRepoError(markMessagesAsReadResult);
                if (markMessagesAsReadResultError) {
                    socket.emit('appError', markMessagesAsReadResultError);
                    return;
                }
            } else {
                socket.emit('appError', {
                    error: true,
                    message: "Chat was not found",
                    statusCode: 404
                });
            }

            // Emit new message event to the room
            io.of(Namespace.CHAT).to(chatId).emit('receiveMessage', {
                error: false,
                data: newMessage,
                statusCode: 200
            });
            console.log(`✅ Message sent successfully to room ${chatId}`);
            return;
        }
    }



    public static async markAsRead(io: Server, socket: ISocket, data: any) {
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;

        const { chatId } = data;
        console.log(
            `👀 User ${userId} marking messages as read in room ${chatId}`
        )

        const repoResult = await this.chatRepo.getChatWithMessages({ id: chatId });
        const repoResultError = Handler.handleRepoError(repoResult);
        if (repoResultError) {
            socket.emit('appError', repoResultError);
            return;
        }
        const chat = repoResult.data;

        if (chat) {
            const messages = chat.messages;
            if (messages.length != 0) {
                const markMessagesAsReadResult = await this.messageRepo.markMessagesAsRead(chat.id, userType);
                const markMessagesAsReadResultError = Handler.handleRepoError(markMessagesAsReadResult);
                if (markMessagesAsReadResultError) {
                    socket.emit('appError', markMessagesAsReadResultError);
                    return;
                }
                socket.to(chatId).emit('updateReadReceipts', chat.messages)
                console.log(`✅ Messages marked as read in room ${chatId}`)
            }
        } else {
            console.log(`⚠️ No chat found for room ${chatId} to mark as read`)
        }
    }

    public static async deleteMessage(io: Server, socket: ISocket, data: any) {
        const { chatId, messageId } = data;
        console.log(`🗑️ Deleting message ${messageId} in room ${chatId}`)

        const repoResult = await this.messageRepo.deleteWithId(messageId);
        const repoResultError = Handler.handleRepoError(repoResult);
        if (repoResultError) {
            socket.emit('appError', repoResultError);
            return;
        }
        socket.to(chatId).emit('messageDeleted', {
            error: false,
            message: "Message has been deleted successfully"
        });
        console.log(
            `✅ Message ${messageId} deleted successfully from room ${chatId}`
        );
    }

    public static async typing(io: Server, socket: ISocket, data: any) {
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;
        const { chatId } = data;

        console.log(`✍️ User ${userId} is typing in room ${chatId}`)
        socket.to(chatId).emit('userTyping', {
            error: false,
            message: "User is typing"
        });
    }

    public static async getUserChats(io: Server, socket: ISocket, data: any) {
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;

        const message = "Chats has been sent successfully";

        if (userType == UserType.Customer) {
            console.log("customer");

            const repoResult = await this.chatRepo.getCustomerChatsWithMessages(userId);
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }

            socket.emit('userChats', Handler.responseData(200, false, message, repoResult.data));
        } else if (userType == UserType.Vendor) {
            console.log("vendor");

            const repoResult = await this.chatRepo.getVendorChatsWithMessages(userId);
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }

            socket.emit('userChats', Handler.responseData(200, false, message, repoResult.data));
        } else {
            socket.emit('appError', {
                error: true,
                message: "Unauthorized user",
                statusCode: 401
            });
            return;
        }
    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = String(socket.locals.data.id);
            const userType = socket.locals.userType;

            const unsuccessful = await (userType == UserType.Customer ? ChatHandler.onlineCustomer : ChatHandler.onlineVendor).delete(userId);
            if (!unsuccessful) {
                socket.emit('appError', {
                    error: true,
                    message: "Something went wrong",
                    statusCode: 500
                });
                return;
            }
            const repoResult = userType == UserType.Customer ? await ChatHandler.chatRepo.getCustomerChatsWithMessages(userId) : await ChatHandler.chatRepo.getVendorChatsWithMessages(userId);
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }
            const chat = repoResult.data;
            const rooms = chat.map((item: any) => item.id);

            if (rooms.length > 0) {
                socket.to(rooms).emit('userIsOffline', {
                    error: false,
                    message: "User has gone offline"
                });
            }
            console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", {
                error: true,
                message: "An internal error occurred",
                statusCode: 500,
            });
        }
    }
}