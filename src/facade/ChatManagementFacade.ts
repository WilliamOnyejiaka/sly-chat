import { Socket } from "socket.io";
// import { OnlineCustomer, OnlineVendor } from "../cache";
import { UserSocket } from "../cache";
import { Chat, Message } from "../services";
import { ISocket, ServiceData, HttpData, UploadedFiles, ChatPagination, MessagePagination, SocketData } from "../types";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { CdnFolders, ResourceType, ServiceResultDataType, UserType } from "../types/enums";
import BaseFacade from "./bases/BaseFacade";
import { logger } from "../config";
import { Cloudinary } from "../services";

export default class ChatManagementFacade extends BaseFacade {

    public readonly chatService = new Chat();
    public readonly messageService = new Message();
    private readonly socketCache: UserSocket = new UserSocket();
    private readonly cloudinary = new Cloudinary();

    public constructor() {
        super();
    }

    private async getUserChats(userId: number, userType: UserType, pagination: ChatPagination, dataType: ServiceResultDataType) {
        return await this.chatService.getUserChatsWithMessages(userId, userType, pagination, dataType);
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

    public async httpGetUserChats(userId: number, userType: UserType, pagination: ChatPagination): Promise<HttpData> {
        return await this.getUserChats(userId, userType, pagination, ServiceResultDataType.HTTP) as HttpData;
    }

    public async socketGetUserChats(userId: number, userType: UserType, pagination: ChatPagination): Promise<ServiceData> {
        return await this.getUserChats(userId, userType, pagination, ServiceResultDataType.SOCKET) as ServiceData;
    }

    public async httpGetChat(chatId: string) {
        return await this.chatService.getChat(chatId, ServiceResultDataType.HTTP);
    }

    public async socketGetChat(chatId: string) {
        return await this.chatService.getChat(chatId, ServiceResultDataType.SOCKET) as ServiceData;
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

    public async getUserChatsAndOfflineMessages(userId: number, userType: UserType, pagination: ChatPagination): Promise<ServiceData> {
        const dataType = ServiceResultDataType.SOCKET;
        const serviceResult = await this.chatService.getUserChatsWithMessages(userId, userType, pagination, dataType) as ServiceData;
        const serviceResultError = super.handleSocketFacadeResultError(serviceResult);
        if (serviceResultError) return serviceResultError;

        const chat = serviceResult.data.items;
        console.log(serviceResult);

        let offlineMessages = chat.flatMap((item: any) => item.messages.filter((message: any) => message.recipientOnline === false));

        const chatIds = offlineMessages.map((item: any) => item.chatId);
        const updateOfflineMessagesResult = await this.messageService.updateOfflineMessages(chatIds, userType, dataType) as ServiceData;
        const updateOfflineMessagesResultError = super.handleSocketFacadeResultError(updateOfflineMessagesResult);
        if (updateOfflineMessagesResultError) return updateOfflineMessagesResultError;

        offlineMessages = offlineMessages.map((item: any) => {
            item.recipientOnline = true;
            return item;
        });

        const rooms = chat.length > 0 ? chat.map((item: any) => `chat_${item.productId}_${item.vendorId}_${item.customerId}`) : null;
        return this.service.socketResponseData(200, false, null, { chat, offlineMessages, rooms, });
    }

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

    // private async markMessagesAsRead(chatId: string, senderType: any, dataType: ServiceResultDataType): Promise<ServiceData | HttpData> {
    //     return (await this.messageService.markMessagesAsRead(chatId, senderType, dataType));
    // }

    // public async socketMarkMessagesAsRead(chatId: string, userType: any): Promise<ServiceData> {
    //     return (await this.markMessagesAsRead(chatId, userType.toUpperCase(), ServiceResultDataType.SOCKET)) as ServiceData;
    // }

    public async insertMessageWithMedia(newMessage: TransactionMessage, uploadedFiles: UploadedFiles[]) {

    }

    public async createChatWithMedia(
        newChat: TransactionChat,
        newMessage: TransactionMessage,
        files: Express.Multer.File[],
        resourceType: ResourceType,
        folder: CdnFolders,
        pagination: ChatPagination
    ) {
        const chatResult = await this.chatService.getChatWithRoomId(newChat.productId, newChat.customerId, newChat.vendorId, pagination, ServiceResultDataType.HTTP) as HttpData;
        if (chatResult.json.error) return chatResult;
        const chat = chatResult.json.data;
        const { uploadedFiles, failedFiles, publicIds } = await this.cloudinary.upload(files, resourceType, folder);
        if (uploadedFiles.length > 0) {
            if (chat) {
                newMessage.chatId = chat.id;
                const serviceResult = await this.messageService.createMessageWithMedia(newMessage, uploadedFiles, ServiceResultDataType.HTTP) as HttpData;
                if (!serviceResult.json.error) {
                    serviceResult.json.data = { message: serviceResult.json.data, isNewChat: false };
                    return serviceResult;
                }
                await this.cloudinary.deleteFiles(publicIds);
                return serviceResult;
            }
            // if (!newChat.storeName || !newChat.customerName || !newChat.productPrice || !newChat.productName || !newChat.productImageUrl) {
            //     await this.cloudinary.deleteFiles(publicIds);
            //     return this.service.httpResponseData(400, true, "All fields are required to create a new chat");
            // }
            const serviceResult = await this.chatService.createChatWithMedia(newChat, newMessage, uploadedFiles, ServiceResultDataType.HTTP) as HttpData;
            if (!serviceResult.json.error) {
                serviceResult.json.data = { chat: serviceResult.json.data, isNewChat: true };
                return serviceResult;
            }
            await this.cloudinary.deleteFiles(publicIds);
            return serviceResult;
        }
        return this.service.httpResponseData(500, true, "Something went wrong", failedFiles);
    }

    public async httpGetChatWithRoomId(productId: number, customerId: number, vendorId: number, pagination: ChatPagination) {
        return await this.chatService.getChatWithRoomId(productId, customerId, vendorId, pagination, ServiceResultDataType.HTTP) as HttpData;
    }

    public async socketGetChatWithRoomId(productId: number, customerId: number, vendorId: number, pagination: MessagePagination) {
        return await this.chatService.getChatWithRoomId(productId, customerId, vendorId, pagination, ServiceResultDataType.SOCKET) as ServiceData;
    }

    public async httpDeleteChat(chatId: string, userId: number, userType: string): Promise<HttpData> {
        return await this.chatService.deleteChat(chatId, userId, userType, ServiceResultDataType.HTTP) as HttpData;
    }
}
