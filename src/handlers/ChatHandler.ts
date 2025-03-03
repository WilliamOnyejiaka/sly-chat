import { Server } from "socket.io";
import { ISocket } from "../types";
import { Namespace, UserType } from "../types/enums";
import Handler from "./Handler";
import { ChatManagementFacade } from "../facade";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { Events } from "./../types/enums";

export default class ChatHandler {

    private static readonly facade: ChatManagementFacade = new ChatManagementFacade();

    public static async onConnection(io: Server, socket: ISocket) {
        console.log("User connected: ", socket.id);
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        console.log(`User id ${userId} , user type ${userType}`);

        const onlineCacheUpdated = await ChatHandler.facade.updateOnlineCache(String(userId), userType, socket);
        if (onlineCacheUpdated.error) {
            socket.emit('appError', onlineCacheUpdated);
            socket.disconnect(true);
            return;
        }

        const getUserChatsAndOfflineMessages = await ChatHandler.facade.getUserChatsAndOfflineMessages(userId, userType);
        if (getUserChatsAndOfflineMessages.error) {
            socket.emit('appError', getUserChatsAndOfflineMessages);
            return;
        }
        console.log("✅ User offline messages has been retrieved");

        const rooms = getUserChatsAndOfflineMessages.data.rooms;
        const offlineMessages = getUserChatsAndOfflineMessages.data.offlineMessages;
        const chat = getUserChatsAndOfflineMessages.data.chat;

        console.log("🚧 Joining rooms...");
        if (rooms) socket.join(rooms);
        console.log("✅ Rooms has been joint");


        io.of(Namespace.CHAT).to(rooms).emit("userIsOnline", Handler.responseData(200, false, "User is online"));
        socket.emit('offlineMessages', Handler.responseData(200, false, "Offline messages has been sent successfully", offlineMessages));
        socket.emit('userChats', Handler.responseData(200, false, "Chats have been sent successfully", chat));
    }

    public static async joinRooms(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.data.id;
        const userType = socket.locals.userType;

        const facadeResult = await ChatHandler.facade.socketGetUserChats(Number(userId), userType);
        if (facadeResult.error) {
            socket.emit('appError', facadeResult);
            return;
        }

        const chats = facadeResult.data;
        const rooms = chats.map((item: any) => item.id);
        if (rooms.length > 0) socket.join(rooms);
        socket.emit('userChats', Handler.responseData(200, false, "Chats has been sent successfully", chats));
    }

    public static async joinChat(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.data.id;
        const userType = socket.locals.userType;
        const senderType = (userType as string).toUpperCase();
        const { chatId } = data;

        if (!chatId) {
            socket.emit('appError', Handler.responseData(400, true, "Chat Id is required"));
            return;
        }

        console.log(`🟢 User ${userId} joining room: ${chatId}`)

        const chatResult = await ChatHandler.facade.socketGetChat(chatId);
        if (chatResult.error) {
            socket.emit('appError', chatResult);
            return;
        }
        const chat = chatResult.data;
        if (chat) {
            socket.join(chatId);
            const messages = chat.messages;
            if (messages.length > 0) {

                // Mark messages as read if the user is the recipient
                const markMessagesAsReadResult = await ChatHandler.facade.socketMarkMessagesAsRead(chat.id, senderType);
                if (markMessagesAsReadResult.error) {
                    socket.emit('appError', markMessagesAsReadResult);
                    return;
                }
                chat.messages = messages.map((item: any) => {
                    if (item.senderType !== senderType) item.read = true;
                    return item;
                });

                //Include the additional fields when sending the chat history
                socket.emit('loadMessages', Handler.responseData(200, false, "Chats has been loaded", chat));
                // socket.to(chatId).emit('updateReadReceipts', Handler.responseData(200, false, "Chats has been updated"));
                return;
            }
        }
    }

    public static async sendMessage(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        const senderType = (userType as string).toUpperCase();

        let {
            recipientId,
            productId,
            chatId,
            text,
            storeName,
            customerName,
            storeLogoUrl,
            customerProfilePic,
            productPrice,
            productName,
            productImageUrl
        } = data;

        if (!recipientId || !text) {
            socket.emit('appError', Handler.responseData(400, true, "Invalid data provided"));
            return;
        }

        let customerId, vendorId;
        if (userType == UserType.Customer) {
            vendorId = recipientId;
            customerId = userId;
        } else if (userType == UserType.Vendor) {
            customerId = recipientId;
            vendorId = userId;
        } else {
            socket.emit('appError', {
                error: true,
                message: "Unauthorized user",
                statusCode: 401
            });
            return;
        }

        const statusResult = await ChatHandler.facade.getRecipientOnlineStatus(userType, recipientId);
        if (statusResult.error) {
            socket.emit('appError', statusResult);
            return;
        }

        const recipientOnlineData = statusResult.data;
        const recipientOnline = !!recipientOnlineData;

        let chat;
        if (!chatId) {
            console.log(`💬 Creating new chat for room `);

            const newChat: TransactionChat = {
                productId: productId as string,
                vendorId,
                customerId,
                customerProfilePic,
                productPrice,
                productName,
                storeName,
                customerName,
                storeLogoUrl,
                productImageUrl,
            };
            const newMessage: TransactionMessage = { senderId: userId, text, recipientOnline, senderType };

            // Create new chat with first message
            const newChatResult = await ChatHandler.facade.createChatWithMessage(newChat, newMessage);
            if (newChatResult.error) {
                socket.emit('appError', newChatResult);
                return;
            }

            chat = newChatResult.data; // Get the newly created chat
            chatId = chat.id;
            console.log(chatId);

            socket.join(chatId);
            console.log(`✅ New chat has been created`);
            // io.of(Namespace.CHAT).to(socket.id).emit('sentMessage', Handler.responseData(200, false, null, chat.messages));
            io.of(Namespace.CHAT).to(chatId).emit('receiveMessage', Handler.responseData(200, false, null, chat.messages));
            if (recipientOnlineData) {
                const recipientSocketId = recipientOnlineData.chatSocketId;
                io.sockets.sockets.get(recipientSocketId)?.join(chatId); //💬 Forcing the the recipient to join the room 
                socket.to(recipientSocketId).emit('newChat', Handler.responseData(200, false, chat));
                console.log(`✅ Message sent directly to user ${recipientId} via socket ${recipientSocketId}`);
                return;
            }
        } else {
            console.log(`📩 User ${userId} sending message to room ${chatId}: "${text}"`);

            const chatResult = await ChatHandler.facade.socketGetChat(chatId);
            if (chatResult.error) {
                socket.emit('appError', chatResult);
                return;
            }

            console.log(`🟡 Adding message to existing chat for room ${chatId}`);
            chat = chatResult.data;
            if (chat) {
                const newMessageResult = await ChatHandler.facade.socketCreateMessage(userId, text, chatId, recipientOnline, senderType);
                if (newMessageResult.error) {
                    socket.emit('appError', newMessageResult);
                    return;
                }

                // Mark all existing messages as read except for the sender's own messages
                const markMessagesAsReadResult = await ChatHandler.facade.socketMarkMessagesAsRead(chat.id, senderType);
                if (markMessagesAsReadResult.error) {
                    socket.emit('appError', markMessagesAsReadResult);
                    return;
                }

                // Emit new message event to the room
                // io.of(Namespace.CHAT).to(chatId).emit('receiveMessage', Handler.responseData(200, false, null, newMessage));
                const newMessage = newMessageResult.data;
                // if (recipientOnline) socket.to(chatId).emit('receiveMessage', Handler.responseData(200, false, null, newMessage));
                // io.of(Namespace.CHAT).to(socket.id).emit('sentMessage', Handler.responseData(200, false, null, newMessage));
                io.of(Namespace.CHAT).to(chatId).emit('receiveMessage', Handler.responseData(200, false, null, newMessage));

                console.log(`✅ Message sent successfully to room ${chatId}`);
                return;
            } else {
                socket.emit('appError', Handler.responseData(404, true, "Chat was not found"));
                return;
            }
        }
    }

    public static async markAsRead(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;

        const { chatId } = data;
        console.log(
            `👀 User ${userId} marking messages as read in room ${chatId}`
        );

        const facadeResult = await ChatHandler.facade.socketGetUserChats(userId, userType);
        if (facadeResult.error) {
            socket.emit('appError', facadeResult);
            return;
        }

        const chat = facadeResult.data;

        if (chat) {
            const messages = chat.messages;
            if (messages.length != 0) {
                const markMessagesAsReadResult = await ChatHandler.facade.socketMarkMessagesAsRead(chatId, userType);
                if (markMessagesAsReadResult.error) {
                    socket.emit('appError', markMessagesAsReadResult);
                    return;
                }
                socket.to(chatId).emit('updateReadReceipts', chat.messages);
                console.log(`✅ Messages marked as read in room ${chatId}`);
            }
        } else {
            console.log(`⚠️ No chat found for room ${chatId} to mark as read`)
        }
    }

    public static async deleteMessage(io: Server, socket: ISocket, data: any) {
        const { chatId, messageId } = data;
        console.log(`🗑️ Deleting message ${messageId} in room ${chatId}`);

        const facadeResult = await ChatHandler.facade.socketDeleteMessage(messageId);
        if (facadeResult.error) {
            socket.emit(Events.APP_ERROR, facadeResult);
            return;
        }

        io.of(Namespace.CHAT).to(chatId).emit('messageDeleted', Handler.responseData(200, false, "Message has been deleted successfully"));
        console.log(
            `✅ Message ${messageId} deleted successfully from room ${chatId}`
        );
    }

    public static async typing(io: Server, socket: ISocket, data: any) {
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;
        const { chatId } = data;

        console.log(`✍️ User ${userId} is typing in room ${chatId}`)
        socket.to(chatId).emit('userTyping', Handler.responseData(200, false, "User is typing"));
    }

    public static async stoppedTyping(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const { chatId } = data;

        console.log(`✍️ User ${userId} is typing in room ${chatId}`)
        socket.to(chatId).emit('stoppedTyping', Handler.responseData(200, false, "User has stopped typing"));
    }

    public static async getUserChats(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;

        const message = "Chats has been sent successfully";
        const facadeResult = await ChatHandler.facade.socketGetUserChats(userId, userType);
        if (facadeResult.error) {
            socket.emit('appError', facadeResult);
            return;
        }

        socket.emit('userChats', Handler.responseData(200, false, message, facadeResult.data));
    }

    public static async editMessage(io: Server, socket: ISocket, data: any) {

    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {// TODO: refractor this method
        try {
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;

            const facadeResult = await ChatHandler.facade.socketGetUserChats(userId, userType);
            if (facadeResult.error) {
                socket.emit('appError', facadeResult);
                return;
            }
            const chat = facadeResult.data;
            const rooms = chat.map((item: any) => item.id);

            if (rooms.length > 0) {
                socket.leave(rooms);
                socket.to(rooms).emit('userIsOffline', Handler.responseData(200, false, "User has gone offline"));
            }
            console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
        }
    }
}