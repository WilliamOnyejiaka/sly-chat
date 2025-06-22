import { Server } from "socket.io";
import { ChatPagination, ISocket, MessagePagination, SocketData } from "../../types";
import { Namespaces, ServiceResultDataType, UserType } from "../../types/enums";
import Handler from "./Handler";
import { ChatManagementFacade } from "../../facade";
import { TransactionChat, TransactionMessage } from "../../types/dtos";
import { Events } from "../../types/enums";
import { updateChat } from "../../config/bullMQ";
import { logger, redisClient } from "../../config";
import { UserSocket } from "../../cache";
import { Customer, Vendor } from "../../services";

export default class ChatHandler {

    private static readonly facade: ChatManagementFacade = new ChatManagementFacade();

    public static async onConnection(io: Server, socket: ISocket) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType as UserType;
        const user = `${userType}:${userId}`;

        logger.info(`${user} with the socket id - ${socket.id} has connected to chat namespace`);

        const onlineCacheUpdated = await ChatHandler.facade.updateChatSocketCache(userId, userType, socket);
        if (onlineCacheUpdated.error) {
            socket.emit(Events.APP_ERROR, onlineCacheUpdated);
            socket.disconnect(true);
            return;
        }

        const offlineMessages = await ChatHandler.facade.messageService.offlineMessages(userId, userType, 1, 10, ServiceResultDataType.SOCKET) as SocketData;
        if (offlineMessages.error) {
            socket.emit(Events.APP_ERROR, offlineMessages);
            return;
        }

        logger.info(`✅ ${user} offline messages has been retrieved`);
        socket.emit('offlineMessages', Handler.responseData(200, false, "Offline messages has been sent successfully", offlineMessages.data));

        logger.info(`🚧 Loading ${user} chats`);
        const serviceResult = await ChatHandler.facade.chatService.loadChatsWithRooms(userId, userType, 1, 10, ServiceResultDataType.SOCKET) as SocketData;
        if (serviceResult.error) {
            socket.emit(Events.APP_ERROR, serviceResult);
            return;
        }
        const { rooms } = serviceResult.data;
        delete serviceResult.data.rooms;

        if (rooms.length > 0) {
            const pushResult = await redisClient.lpush(`user:rooms:${socket.id}`, rooms);
            socket.join(rooms);

            logger.info(`✅ ${user} has joined ${rooms.length} rooms`);
        } else logger.info(`🤷 No rooms found for ${user}`);

        socket.emit('userChats', Handler.responseData(200, false, "Chats have been sent successfully", serviceResult.data));
    }

    public static async checkOnlinePresence(io: Server, socket: ISocket, data: any) {
        const { userId, userType } = data;

        if (!userId || !userType) {
            socket.emit(Events.APP_ERROR, Handler.responseData(400, true, "Invalid data provided"));
            return;
        }

        const socketCache = new UserSocket();

        const cache = await socketCache.get(userType, Number(userId));
        if (cache.error) {
            socket.emit(Events.APP_ERROR, Handler.responseData(500, true, "An internal error occurred"));
            return;
        }

        const socketData = cache.data;

        if (socketData && socketData.chat) {
            socket.emit(Events.ONLINE_PRESENCE, Handler.responseData(200, false, "User is online", { status: true, lastSeen: null }));
        } else {
            const customerService = new Customer();
            const vendorService = new Vendor();
            const serviceResult = (userType === UserType.Customer ? await customerService.getLastSeen(userId) : await vendorService.getLastSeen(userId)) as SocketData;
            if (serviceResult.error) {
                socket.emit(Events.APP_ERROR, serviceResult);
                return;
            }

            socket.emit(Events.ONLINE_PRESENCE, Handler.responseData(200, false, "User is offline", { status: false, lastSeen: serviceResult.data.lastSeen }));
        }
    }

    public static async joinRooms(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.data.id;
        const userType = socket.locals.userType;
        const pagination: ChatPagination = {
            page: 1,
            limit: 10,
            message: {
                page: 1,
                limit: 10
            }
        };

        const facadeResult = await ChatHandler.facade.socketGetUserChats(Number(userId), userType, pagination);
        if (facadeResult.error) {
            socket.emit('appError', facadeResult);
            return;
        }

        const chats = facadeResult.data;
        const rooms = chats.map((item: any) => `chat_${item.productId}_${item.vendorId}_${item.customerId}`);
        if (rooms.length > 0) socket.join(rooms);
        socket.emit('userChats', Handler.responseData(200, false, "Chats has been sent successfully", chats));
    }

    public static async joinChat(io: Server, socket: ISocket, data: any) {
        const userId = socket.locals.data.id;
        const userType = socket.locals.userType;
        let { productId, recipientId } = data;
        const pagination: MessagePagination = {
            page: 1,
            limit: 10
        };

        const [customerId, vendorId] = userType === UserType.Customer ? [userId, recipientId] : [recipientId, userId];
        const room = `chat_${productId}_${vendorId}_${customerId}`;

        const facadeResult = await ChatHandler.facade.chatService.joinChat(productId, customerId, vendorId, pagination, userType);
        if (facadeResult.error) {
            socket.emit(Events.APP_ERROR, facadeResult);
            return;
        }

        logger.info(`🏃 ${userType}:${userId} joining room: ${room}`)

        const chat = facadeResult.data;
        if (chat) {
            const rooms = await redisClient.lrange(`user:rooms:${socket.id}`, 0, -1);
            if (!rooms.includes(room)) {
                const pushResult = await redisClient.lpush(`user:rooms:${socket.id}`, room);
                // console.log(pushResult);
                socket.join(room);
                logger.info(`🟢 ${userType}:${userId} has joint room: ${room}`)
            } else logger.warn(`⚠️  ${userType}:${userId} is already in room: ${room}`)

            socket.emit('loadChat', Handler.responseData(200, false, "Chat has been loaded", chat));
        } else logger.warn(`⚠️ No chat found for room ${room}`);
    }

    public static async sendMessage(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        const senderType = (userType as string).toUpperCase();
        const chatNamespace = io.of(Namespaces.CHAT);

        let {
            recipientId,
            productId,
            text
        } = data;

        if (!recipientId || !text || !productId) {
            socket.emit(Events.APP_ERROR, Handler.responseData(400, true, "Invalid data provided"));
            return;
        }

        const [customerId, vendorId] = userType === UserType.Customer ? [userId, recipientId] : [recipientId, userId];
        const recipientType = (userType === UserType.Customer ? UserType.Vendor : UserType.Customer).toUpperCase();

        const statusResult = await ChatHandler.facade.getRecipientOnlineStatus(userType, recipientId);
        if (statusResult.error) {
            socket.emit(Events.APP_ERROR, statusResult);
            return;
        }

        const recipientOnlineData = statusResult.data;
        const recipientOnline = recipientOnlineData.data && recipientOnlineData.data.chat ? true : false;
        const room = `chat_${productId}_${vendorId}_${customerId}`;

        const chatId: string | null = ((await ChatHandler.facade.chatService.getChatId(productId, customerId, vendorId)) as { statusCode: number; error: boolean; message: string | null; data: any }).data?.id;

        if (!chatId) {
            console.log(`💬 Creating new chat for room `);
            const unReadData = userType === UserType.Customer ? { unReadVendorMessages: true } : { unReadCustomerMessages: true };

            const newChat: TransactionChat = {
                productId,
                vendorId,
                customerId,
                ...unReadData
            };
            const newMessage: TransactionMessage = { senderId: userId, text, recipientOnline, senderType, recipientType, recipientId };

            // Create new chat with first message
            const newChatResult = await ChatHandler.facade.createChatWithMessage(newChat, newMessage);
            if (newChatResult.error) {
                socket.emit('appError', newChatResult);
                return;
            }

            const chat = newChatResult.data; // Get the newly created chat

            const pushResult = await redisClient.lpush(`user:rooms:${socket.id}`, room);
            socket.join(room);

            console.log(`✅ New chat has been created`);
            const vendorProfile = chat.vendor;
            const customerProfile = chat.customer;
            delete chat.vendor;
            delete chat.customer;

            let senderChat;
            let recipientChat;
            if (senderType === UserType.Customer.toUpperCase()) {
                senderChat = {
                    ...chat,
                    vendor: vendorProfile
                };
                recipientChat = {
                    ...chat,
                    customer: customerProfile
                };
            } else {
                senderChat = {
                    ...chat,
                    customer: customerProfile
                };
                recipientChat = {
                    ...chat,
                    vendor: vendorProfile
                };
            }
            socket.emit('newSentChat', Handler.responseData(200, false, null, senderChat));
            chatNamespace.to(room).emit('receiveMessage', Handler.responseData(200, false, null, chat.messages[0]));

            const cacheKey = `chat:messages:${room}`;
            const cacheMessage = JSON.stringify(chat.messages[0]);
            await redisClient.lpush(cacheKey, cacheMessage);
            await redisClient.expire(cacheKey, 3600); // Set TTL to 1 hour

            if (recipientOnlineData) {
                const recipientSocketId = recipientOnlineData.chat;
                const pushResult = await redisClient.lpush(`user:rooms:${recipientSocketId}`, room);
                chatNamespace.sockets.get(recipientSocketId)?.join(room); //💬 Forcing the the recipient to join the room 
                socket.to(recipientSocketId).emit('newChat', Handler.responseData(200, false, null, recipientChat));
                const recipientType = userType === UserType.Customer ? UserType.Vendor : UserType.Customer;
                await updateChat.add('updateChat', { recipientId, recipientType, recipientSocketId }, { jobId: `send-${Date.now()}`, priority: 1 });
                console.log(`✅ Message sent directly to user ${recipientId} via socket ${recipientSocketId}`);
                return;
            }
        } else {
            console.log(`📩 User ${userId} sending message to room ${room}: "${text}"`);

            console.log(`🟡 Adding message to existing chat for room ${room}`);
            const newMessageResult = await ChatHandler.facade.socketCreateMessage(userId, recipientId, text, chatId, recipientOnline, senderType);
            if (newMessageResult.error) {
                socket.emit(Events.APP_ERROR, newMessageResult);
                return;
            }

            // Emit new message event to the room
            const newMessage = newMessageResult.data;
            chatNamespace.to(room).emit('receiveMessage', Handler.responseData(200, false, null, newMessage));

            // TODO: convert this to a function
            const cacheKey = `chat:messages:${room}`;
            const cacheMessage = JSON.stringify(newMessage);

            // Add to Redis list (limit to 10 messages)
            await redisClient.lpush(cacheKey, cacheMessage);
            await redisClient.ltrim(cacheKey, 0, 9); // Keep only the latest 10 messages
            await redisClient.expire(cacheKey, 3600); // Set TTL to 1 hour

            console.log(`✅ Message sent successfully to room ${room}`);
            return;
        }
    }

    public static async markAsRead(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        const { productId, recipientId } = data;

        if (!recipientId || !productId) {
            socket.emit(Events.APP_ERROR, Handler.responseData(400, true, "Invalid data provided"));
            return;
        }

        const [customerId, vendorId] = userType === UserType.Customer ? [userId, recipientId] : [recipientId, userId];
        const room = `${productId}_${vendorId}_${customerId}`;

        logger.info(`👀 ${userType}:${userId} marking messages as read in room ${room}`);

        const facadeResult = await ChatHandler.facade.chatService.markAsRead({ productId, customerId, vendorId }, userType) as SocketData;
        if (facadeResult.error) {
            socket.emit(Events.APP_ERROR, facadeResult);
            return;
        }

        const chat = facadeResult.data;
        if (chat) {
            console.log(chat);
            socket.to(room).emit('updateReadReceipts', chat);
            console.log(`✅ Messages marked as read in room ${room}`);
        } else {
            console.log(`⚠️ No chat found for room ${room} to mark as read`)
        }
    }

    public static async deleteMessage(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        const { productId, recipientId, messageId } = data;
        const [customerId, vendorId] = userType === UserType.Customer ? [userId, recipientId] : [recipientId, userId];
        const room = `chat_${productId}_${vendorId}_${customerId}`;
        console.log(`🗑️ Deleting message ${messageId} in room ${room}`);

        const facadeResult = await ChatHandler.facade.socketDeleteMessage(messageId, userId, userType);
        if (facadeResult.error) {
            socket.emit(Events.APP_ERROR, facadeResult);
            return;
        }

        io.of(Namespaces.CHAT).to(room).emit('messageDeleted', Handler.responseData(200, false, "Message has been deleted successfully"));
        console.log(
            `✅ Message ${messageId} deleted successfully from room ${room}`
        );
    }

    public static async typing(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        const { productId, recipientId } = data;
        const [customerId, vendorId] = userType === UserType.Customer ? [userId, recipientId] : [recipientId, userId];
        const room = `chat_${productId}_${vendorId}_${customerId}`;

        console.log(`✍️ User ${userId} is typing in room ${room}`)
        socket.to(room).emit('userTyping', Handler.responseData(200, false, "User is typing"));
    }

    public static async stoppedTyping(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        const { productId, recipientId } = data;
        const [customerId, vendorId] = userType === UserType.Customer ? [userId, recipientId] : [recipientId, userId];
        const room = `chat_${productId}_${vendorId}_${customerId}`;

        console.log(`✍️ User ${userId} is typing in room ${room}`)
        socket.to(room).emit('stoppedTyping', Handler.responseData(200, false, "User has stopped typing"));
    }

    public static async getUserChats(io: Server, socket: ISocket, data: any) {
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        const { page, limit, messagePage, messageLimit } = data;
        const arr = [page, limit, messagePage, messageLimit];
        const isValid = arr.every(item => typeof item === "number" && item !== undefined);
        if (!isValid) {
            socket.emit(Events.APP_ERROR, {
                error: true,
                message: "All values are required and all must be integers",
                data: {}
            });
            return;
        }

        const message = "Chats has been sent successfully";
        const pagination: ChatPagination = {
            page: page,
            limit: limit,
            message: {
                page: messagePage,
                limit: messageLimit
            }
        };

        const facadeResult = await ChatHandler.facade.socketGetUserChats(userId, userType, pagination);
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
            const customerService = new Customer();
            const vendorService = new Vendor();

            const cacheResult = await ChatHandler.facade.deleteUserChatSocketId(userId, userType);
            if (cacheResult.error) {
                logger.error(`🛑 Failed to remove ${userType}:${userId} socket id from chat cache.`);
                socket.emit(Events.APP_ERROR, cacheResult);
                return;
            }

            const serviceResult = userType === UserType.Customer ? await customerService.updateLastSeen(userId) : await vendorService.updateLastSeen(userId);

            const rooms = await redisClient.lrange(`user:rooms:${socket.id}`, 0, -1);

            if (rooms.length > 0) {
                rooms.forEach(async (room) => socket.leave(room));
                const deleted = await redisClient.del(`user:rooms:${socket.id}`);
            }

            logger.info(`${userType}:${userId} with the socket id - ${socket.id} has disconnected from chat namespace`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
        }
    }
}