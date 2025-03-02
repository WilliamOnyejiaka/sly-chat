import { Socket } from "socket.io";
import { OnlineCustomer, OnlineVendor } from "../cache";
import { Chat, Message } from "../services";
import { ISocket, ServiceData, ServiceResult } from "../types";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { ServiceResultDataType, UserType } from "../types/enums";
import BaseFacade from "./bases/BaseFacade";

export default class ChatManagementFacade extends BaseFacade {

    private readonly chatService = new Chat();
    private readonly messageService = new Message();
    private readonly onlineCustomer: OnlineCustomer = new OnlineCustomer();
    private readonly onlineVendor: OnlineVendor = new OnlineVendor();

    public constructor() {
        super();
    }

    private async getUserChats(userId: number, userType: UserType, dataType: ServiceResultDataType) {
        return await this.chatService.getUserChats(userId, userType, dataType);
    }


    public async httpGetUserChats(userId: number, userType: UserType): Promise<ServiceResult> {
        return await this.getUserChats(userId, userType, ServiceResultDataType.HTTP) as ServiceResult;
    }

    public async socketGetUserChats(userId: number, userType: UserType): Promise<ServiceData> {
        return await this.getUserChats(userId, userType, ServiceResultDataType.SOCKET) as ServiceData;
    }

    public async httpGetChat(chatId: string) {
        return await this.chatService.getChat(chatId, ServiceResultDataType.HTTP);
    }

    public async socketGetChat(chatId: string) {
        return await this.chatService.getChat(chatId, ServiceResultDataType.SOCKET) as ServiceData;
    }

    public async deleteMessage(messageId: string, dataType: ServiceResultDataType) {
        return await this.messageService.deleteMessage(messageId, dataType);
    }

    public async httpDeleteMessage(messageId: string) {
        return await this.deleteMessage(messageId, ServiceResultDataType.HTTP) as ServiceResult;
    }

    public async socketDeleteMessage(messageId: string) {
        return await this.deleteMessage(messageId, ServiceResultDataType.SOCKET) as ServiceData;
    }

    public async getUserChatsAndOfflineMessages(userId: number, userType: UserType): Promise<ServiceData> {
        const dataType = ServiceResultDataType.SOCKET;
        const serviceResult = await this.chatService.getUserChatsWithMessages(userId, userType, dataType) as ServiceData;
        const serviceResultError = super.handleSocketFacadeResultError(serviceResult);
        if (serviceResultError) return serviceResultError;

        const chat = serviceResult.data;
        let offlineMessages = chat.flatMap((item: any) => item.messages.filter((message: any) => message.recipientOnline === false));

        const chatIds = offlineMessages.map((item: any) => item.chatId);
        const updateOfflineMessagesResult = await this.messageService.updateOfflineMessages(chatIds, userType, dataType) as ServiceData;
        const updateOfflineMessagesResultError = super.handleSocketFacadeResultError(updateOfflineMessagesResult);
        if (updateOfflineMessagesResultError) return updateOfflineMessagesResultError;

        offlineMessages = offlineMessages.map((item: any) => {
            item.recipientOnline = true;
            return item;
        });

        const rooms = chat.length > 0 ? chat.map((item: any) => item.id) : null;
        return this.service.socketResponseData(200, false, null, { chat, offlineMessages, rooms });
    }


    public async updateOnlineCache(userId: string, userType: UserType, socket: ISocket): Promise<ServiceData> {
        const cache = userType === UserType.Customer ? this.onlineCustomer : this.onlineVendor;
        const onlineCache = await cache.get(userId);
        if (onlineCache.error) return this.service.socketResponseData(500, true, "Something went wrong")

        const onlineData = onlineCache.data;
        if (!onlineData) return this.service.socketResponseData(400, true, "Connect to presence namespace first");

        const socketId = JSON.parse(onlineData).socketId;
        const successful = await cache.set(userId, {
            chatSocketId: socket.id,
            socketId,
        });

        if (!successful) this.service.socketResponseData(500, true, "Something went wrong")

        return this.service.socketResponseData(200, false);
    }

    public async getRecipientOnlineStatus(userType: UserType, recipientId: string) {
        const recipientOnlineCache = await (userType === UserType.Customer
            ? this.onlineVendor
            : this.onlineCustomer).get(recipientId);
        if (recipientOnlineCache.error) return this.service.socketResponseData(500, true, "Something went wrong");

        const data = recipientOnlineCache?.data ? JSON.parse(recipientOnlineCache.data) : null;
        return this.service.socketResponseData(200, false, null, data);
    }

    public async getUserOnlineStatus(userType: UserType, userId: string) {
        const recipientOnlineCache = await (userType === UserType.Vendor
            ? this.onlineVendor
            : this.onlineCustomer).get(userId);
        if (recipientOnlineCache.error) return this.service.socketResponseData(500, true, "Something went wrong");

        const data = recipientOnlineCache?.data ? JSON.parse(recipientOnlineCache.data) : null;
        return this.service.socketResponseData(200, false, null, data);
    }

    public async createChatWithMessage(newChat: TransactionChat, newMessage: TransactionMessage): Promise<ServiceData> {
        return (await this.chatService.createChatWithMessage(newChat, newMessage, ServiceResultDataType.SOCKET)) as ServiceData;
    }

    private async createMessage(userId: number, text: string, chatId: string, recipientOnline: boolean, senderType: any, dataType: ServiceResultDataType): Promise<ServiceData | ServiceResult> {
        return (await this.messageService.createMessage(userId, text, chatId, recipientOnline, senderType, dataType))
    }

    public async socketCreateMessage(userId: number, text: string, chatId: string, recipientOnline: boolean, senderType: any): Promise<ServiceData> {
        return (await this.createMessage(userId, text, chatId, recipientOnline, senderType, ServiceResultDataType.SOCKET)) as ServiceData
    }

    private async markMessagesAsRead(chatId: string, senderType: any, dataType: ServiceResultDataType): Promise<ServiceData | ServiceResult> {
        return (await this.messageService.markMessagesAsRead(chatId, senderType, dataType));
    }

    public async socketMarkMessagesAsRead(chatId: string, senderType: any): Promise<ServiceData> {
        return (await this.markMessagesAsRead(chatId, senderType, ServiceResultDataType.SOCKET)) as ServiceData;
    }
}
