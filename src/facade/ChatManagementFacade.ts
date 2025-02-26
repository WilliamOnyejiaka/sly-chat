import { OnlineCustomer, OnlineVendor } from "../cache";
import { Chat, Message } from "../services";
import { ISocket, ServiceData } from "../types";
import { ServiceResultDataType, UserType } from "../types/enums";
import BaseFacade from "./bases/BaseFacade";

export default class ChatManagementFacade extends BaseFacade {

    private readonly chatService = new Chat();
    private readonly messageService = new Message();
    private readonly onlineCustomer: OnlineCustomer = new OnlineCustomer();
    private readonly onlineVendor: OnlineVendor = new OnlineVendor();

    public async getUserChats(userId: string, userType: UserType) {
        return await this.chatService.getUserChats(userId, userType);
    }

    public async getChat(publicId: string) {
        return await this.chatService.getChat(publicId);
    }

    public async deleteMessage(messageId: string) {
        return await this.messageService.deleteMessage(messageId);
    }

    public async getUserChatsAndOfflineMessages(userId: string, userType: UserType): Promise<ServiceData> {
        const dataType = ServiceResultDataType.SOCKET;
        const serviceResult = await this.chatService.getUserChatsWithMessages(userId, userType, dataType) as ServiceData;
        const serviceResultError = super.handleSocketFacadeResultError(serviceResult);
        if (serviceResultError) return serviceResultError;

        const chat = serviceResult.data;
        let offlineMessages = chat.flatMap((item: any) => item.messages.filter((message: any) => message.recipientOnline === false));

        const chatIds = offlineMessages.map((item: any) => item.chatId);
        const updateOfflineMessagesResult = await this.messageService.updateOfflineMessages(chatIds, userId, userType, dataType) as ServiceData;
        const updateOfflineMessagesResultError = super.handleSocketFacadeResultError(updateOfflineMessagesResult);
        if (updateOfflineMessagesResultError) return updateOfflineMessagesResultError;

        offlineMessages = offlineMessages.map((item: any) => {
            item.recipientOnline = true;
            return item;
        });

        const rooms = chat.length > 0 ? chat.map((item: any) => item.id) : null;
        return this.chatService.socketResponseData(200, false, null, { chat, offlineMessages, rooms });
    }


    public async updateOnlineCache(userId: string, userType: UserType, socket: ISocket): Promise<ServiceData> {
        const cache = userType === UserType.Customer ? this.onlineCustomer : this.onlineVendor;
        const onlineCache = await cache.get(userId);
        if (onlineCache.error) return super.handleSocketFacadeResultError(500, true, "Something went wrong");

        const onlineData = onlineCache.data;
        const onlineDataErrorMessage = "Connect to presence namespace first";

        if (!onlineData) return super.handleSocketFacadeResultError(
            onlineDataErrorMessage,
            super.socketResponseData(400, true, onlineDataErrorMessage)
        );

        const socketId = JSON.parse(onlineData).socketId;
        const successful = await cache.set(userId, {
            chatSocketId: socket.id,
            socketId,
        });

        if (!successful) return super.handleSocketFacadeResultError(
            "🛑 Caching was unsuccessful",
            super.socketResponseData(500, true, "Something went wrong")
        );

        return super.socketResponseData(200, false);
    }

}

