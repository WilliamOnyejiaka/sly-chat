import { Server } from "socket.io";
import { OnlineCustomer, OnlineVendor } from "../../cache";
import { ISocket, ServiceData } from "../../types";
import { Namespace, UserType } from "../../types/enums";
import { Chat as ChatRepo, Message } from "./../../repos";
import { v4 as uuidv4 } from 'uuid';
import Base from "./bases/Base";
import { logger } from "../../config";


export default class Chat extends Base {

    private readonly chatRepo = new ChatRepo();
    private readonly messageRepo = new Message();
    private readonly onlineCustomer: OnlineCustomer = new OnlineCustomer();
    private readonly onlineVendor: OnlineVendor = new OnlineVendor();

    public async updateOnlineCache(userId: string, userType: UserType, socket: ISocket): Promise<ServiceData> {
        const cache = userType === UserType.Customer ? this.onlineCustomer : this.onlineVendor;
        const onlineCache = await cache.get(userId);
        if (onlineCache.error) return super.handleServiceResultError(
            "🛑 Failed to get user cache",
            super.responseData(500, true, "Something went wrong")
        );

        const onlineData = onlineCache.data;
        const onlineDataErrorMessage = "Connect to presence namespace first";

        if (!onlineData) return super.handleServiceResultError(
            onlineDataErrorMessage,
            super.responseData(400, true, onlineDataErrorMessage)
        );

        const socketId = JSON.parse(onlineData).socketId;
        const successful = await cache.set(userId, {
            chatSocketId: socket.id,
            socketId,
        });

        if (!successful) return super.handleServiceResultError(
            "🛑 Caching was unsuccessful",
            super.responseData(500, true, "Something went wrong")
        );

        return super.responseData(200, false);
    }

    public async getUserChatsAndOfflineMessages(userId: string, userType: UserType): Promise<ServiceData> {
        const repoResult = userType === UserType.Customer
            ? await this.chatRepo.getCustomerChatsWithMessages(userId)
            : await this.chatRepo.getVendorChatsWithMessages(userId);

        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const chat = repoResult.data;
        let offlineMessages = chat.flatMap((item: any) => item.messages.filter((message: any) => message.recipientOnline === false));

        const chatIds = offlineMessages.map((item: any) => item.chatId);
        const updateOfflineMessagesRepoResult = await this.messageRepo.updateOfflineMessages(chatIds, userId, userType);
        const updateOfflineMessagesRepoResultError = super.handleRepoError(updateOfflineMessagesRepoResult);
        if (updateOfflineMessagesRepoResultError) return updateOfflineMessagesRepoResultError;

        offlineMessages = offlineMessages.map((item: any) => {
            item.recipientOnline = true;
            return item;
        });

        const rooms = chat.length > 0 ? chat.map((item: any) => item.id) : null;
        return super.responseData(200, false, null, { chat, offlineMessages, rooms });
    }

    public async getChatWithMessages(id: string): Promise<ServiceData> {
        const repoResult = await this.chatRepo.getChatWithMessages({ id });
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(200, false, null, repoResult.data);
    }

}