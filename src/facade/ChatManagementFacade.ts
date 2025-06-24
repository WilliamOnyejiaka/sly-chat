import { UserSocket } from "../cache";
import { Chat, Message } from "../services";
import { ISocket, ServiceData, HttpData, UploadedFiles, ChatPagination, MessagePagination, SocketData } from "../types";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { CdnFolders, ResourceType, ServiceResultDataType, UserType } from "../types/enums";
import BaseFacade from "./bases/BaseFacade";
import { logger, redisClient } from "../config";
import { Cloudinary } from "../services";

export default class ChatManagementFacade extends BaseFacade {

    public readonly chatService = new Chat();
    public readonly messageService = new Message();
    private readonly socketCache: UserSocket = new UserSocket();
    private readonly cloudinary = new Cloudinary();

    public constructor() {
        super();
    }

    public async deleteUserChatSocketId(userId: number, userType: UserType) {
        const cache = await this.socketCache.get(userType, userId);
        if (cache.error) return this.service.responseData(ServiceResultDataType.SOCKET, 500, true, "An internal error occurred") as SocketData;

        const socketData = cache.data;
        if (socketData) {
            socketData.chat = null;
            if (await this.socketCache.set(userType, userId, { ...socketData })) {
                return this.service.responseData(ServiceResultDataType.SOCKET, 200, false, null) as SocketData;
            }
            return this.service.responseData(ServiceResultDataType.SOCKET, 500, true, "An internal error occurred") as SocketData;
        }
        return this.service.responseData(ServiceResultDataType.SOCKET, 200, false, null) as SocketData;
    }

    public async deleteMessage(messageId: string, userId: number, userType: string, dataType: ServiceResultDataType) {
        return await this.messageService.deleteMessage(messageId, userId, userType, dataType);
    }

    public async httpDeleteMessage(messageId: string, userId: number, userType: string,) {
        return await this.deleteMessage(messageId, userId, userType, ServiceResultDataType.HTTP) as HttpData;
    }

    public async socketDeleteMessage(messageId: string, userId: number, userType: string,) {
        return await this.deleteMessage(messageId, userId, userType, ServiceResultDataType.SOCKET) as ServiceData;
    }

    // public async getUserChatsAndOfflineMessages(userId: number, userType: UserType, pagination: ChatPagination): Promise<ServiceData> {
    //     const dataType = ServiceResultDataType.SOCKET;
    //     const serviceResult = await this.chatService.getUserChatsWithMessages(userId, userType, pagination, dataType) as ServiceData;
    //     const serviceResultError = super.handleSocketFacadeResultError(serviceResult);
    //     if (serviceResultError) return serviceResultError;

    //     const chat = serviceResult.data.items;
    //     console.log(serviceResult);

    //     let offlineMessages = chat.flatMap((item: any) => item.messages.filter((message: any) => message.recipientOnline === false));

    //     const chatIds = offlineMessages.map((item: any) => item.chatId);
    //     const updateOfflineMessagesResult = await this.messageService.updateOfflineMessages(chatIds, userType, dataType) as ServiceData;
    //     const updateOfflineMessagesResultError = super.handleSocketFacadeResultError(updateOfflineMessagesResult);
    //     if (updateOfflineMessagesResultError) return updateOfflineMessagesResultError;

    //     offlineMessages = offlineMessages.map((item: any) => {
    //         item.recipientOnline = true;
    //         return item;
    //     });

    //     const rooms = chat.length > 0 ? chat.map((item: any) => `chat_${item.productId}_${item.vendorId}_${item.customerId}`) : null;
    //     return this.service.socketResponseData(200, false, null, { chat, offlineMessages, rooms, });
    // }

    public async updateChatSocketCache(userId: number, userType: UserType, socket: ISocket): Promise<ServiceData> {
        const onlineCache = await this.socketCache.get(userType, userId);
        if (onlineCache.error) return this.service.socketResponseData(500, true, "Something went wrong")

        const onlineData = onlineCache.data;

        const successful = await this.socketCache.set(userType, userId, {
            ...onlineData,
            chat: socket.id,
        });

        if (!successful) this.service.socketResponseData(500, true, "Something went wrong")

        return this.service.socketResponseData(200, false);
    }

    public async getRecipientOnlineStatus(userType: UserType, recipientId: number) {
        const recipientType = userType === UserType.Customer ? UserType.Vendor : UserType.Customer;
        const recipientOnlineCache = await this.socketCache.get(recipientType, recipientId);
        if (recipientOnlineCache.error) return this.service.socketResponseData(500, true, "Something went wrong");
        return this.service.socketResponseData(200, false, null, recipientOnlineCache.data);
    }

    public async getUserOnlineStatus(userType: UserType, userId: number) {
        const recipientOnlineCache = await this.socketCache.get(userType, userId);
        if (recipientOnlineCache.error) return this.service.socketResponseData(500, true, "Something went wrong");

        return this.service.socketResponseData(200, false, null, recipientOnlineCache.data);
    }

    public async getUsersOnlineStatus(userId: number, recipientId: number, userType: UserType) {
        const userSocket = await this.getUserOnlineStatus(userType, userId);
        if (userSocket.error || !userSocket.data) {
            logger.error("Something went wrong,failed to get user online status");
            return this.service.socketResponseData(500, true, "Something went wrong,failed to get user online status");
        }

        const recipientSocket = await this.getRecipientOnlineStatus(userType, recipientId);
        if (recipientSocket.error) {
            logger.error("Something went wrong,failed to get recipient online status")
            return this.service.socketResponseData(500, true, "Something went wrong,failed to get user online status");
        }

        return this.service.socketResponseData(200, false, null, {
            userSocketId: userSocket.data.chat,
            recipientSocketId: recipientSocket.data?.chat as string | null
        })
    }

    public async createChatWithMessage(newChat: TransactionChat, newMessage: TransactionMessage): Promise<ServiceData> {
        return (await this.chatService.createChatWithMessage(newChat, newMessage, ServiceResultDataType.SOCKET)) as ServiceData;
    }

    private async createMessage(userId: number, recipientId: number, text: string, chatId: string, recipientOnline: boolean, senderType: any, dataType: ServiceResultDataType): Promise<ServiceData | HttpData> {
        return (await this.messageService.createMessage(userId, recipientId, text, chatId, recipientOnline, senderType, dataType))
    }

    public async socketCreateMessage(userId: number, recipientId: number, text: string, chatId: string, recipientOnline: boolean, senderType: any): Promise<ServiceData> {
        return (await this.createMessage(userId, recipientId, text, chatId, recipientOnline, senderType, ServiceResultDataType.SOCKET)) as ServiceData
    }

    public async createMessageMedia(
        newChat: TransactionChat,
        newMessage: TransactionMessage,
        files: Express.Multer.File[],
        resourceType: ResourceType,
        folder: CdnFolders
    ) {
        const chatId: string | null = ((await this.chatService.getChatId(newChat.productId, newChat.customerId, newChat.vendorId)) as { statusCode: number; error: boolean; message: string | null; data: any }).data?.id;
        const { uploadedFiles, failedFiles, publicIds } = await this.cloudinary.upload(files, resourceType, folder);
        if (uploadedFiles.length > 0) {
            const room = `chat_${newChat.productId}_${newChat.vendorId}_${newChat.customerId}`;
            const cacheKey = `chat:messages:${room}`;

            if (chatId) {
                newMessage.chatId = chatId;
                const serviceResult = await this.messageService.createMessageWithMedia(newMessage, uploadedFiles, ServiceResultDataType.HTTP) as HttpData;
                if (!serviceResult.json.error) {
                    const message = serviceResult.json.data;

                    const cacheMessage = JSON.stringify(message);
                    await redisClient.lpush(cacheKey, cacheMessage);
                    await redisClient.expire(cacheKey, 3600); // Set TTL to 1 hour

                    serviceResult.json.data = { message, isNewChat: false };
                    return serviceResult;
                }
                await this.cloudinary.deleteFiles(publicIds);
                return serviceResult;
            }
            const serviceResult = await this.chatService.createChatWithMedia(newChat, newMessage, uploadedFiles, ServiceResultDataType.HTTP) as HttpData;
            if (!serviceResult.json.error) {
                // Add to Redis list (limit to 10 messages)
                const message = serviceResult.json.data.messages[0];
                const cacheMessage = JSON.stringify(message);
                await redisClient.lpush(cacheKey, cacheMessage);
                await redisClient.ltrim(cacheKey, 0, 9); // Keep only the latest 10 messages
                await redisClient.expire(cacheKey, 3600); // Set TTL to 1 hour

                serviceResult.json.data = { chat: serviceResult.json.data, isNewChat: true };
                return serviceResult;
            }
            await this.cloudinary.deleteFiles(publicIds);
            return serviceResult;
        }
        return this.service.httpResponseData(500, true, "Something went wrong", failedFiles);
    }

    public async httpDeleteChat(chatId: string, userId: number, userType: string): Promise<HttpData> {
        return await this.chatService.deleteChat(chatId, userId, userType, ServiceResultDataType.HTTP) as HttpData;
    }
}
