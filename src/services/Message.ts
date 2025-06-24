import constants, { http, urls } from "../constants";
import { Chat as ChatRepo, Message as MessageRepo } from "../repos";
import { CustomerCache, MessagesCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";
import { UploadedFiles } from "../types";
import { TransactionMessage } from "../types/dtos";
import { getPagination } from "../utils";
import { logger, redisClient } from "../config";
import { updateMessages } from "../config/bullMQ";

export default class Message extends BaseService<MessageRepo> {

    private messagesCache = new MessagesCache();

    public constructor() {
        super(new MessageRepo())
    }

    public async createMessage(userId: number, recipientId: number, text: string, chatId: string, recipientOnline: boolean, senderType: any, dataType: ServiceResultDataType) {
        const recipientType = (senderType.toLowerCase() === UserType.Customer ? UserType.Vendor : UserType.Customer).toUpperCase();
        const repoResult = await this.repo!.insert({ senderId: userId, text, chatId, recipientOnline, senderType, recipientType, recipientId });
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 201, false, "Message has been created successfully", repoResult.data)
    }

    public async createMessageWithMedia(newMessage: TransactionMessage, uploadedFiles: UploadedFiles[], dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.insertWithMedia(newMessage, uploadedFiles);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 201, false, null, repoResult.data);
    }

    public async deleteMessage(messageId: string, userId: number, userType: string, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.deleteMessage(messageId, userId, userType.toUpperCase());
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 200, false, "Message has been deleted successfully");
    }

    public async updateOfflineMessages(chatIds: any[], userType: UserType, dataType: ServiceResultDataType) {
        const updateOfflineMessagesRepoResult = await this.repo!.updateOfflineMessages(chatIds, userType.toUpperCase());
        const updateOfflineMessagesRepoResultError = super.handleRepoError(dataType, updateOfflineMessagesRepoResult);
        if (updateOfflineMessagesRepoResultError) return updateOfflineMessagesRepoResultError;
        return super.responseData(dataType, 200, false, "Messages has been updated successfully", updateOfflineMessagesRepoResult.data);
    }

    public async offlineMessages(userId: number, userType: UserType, page: number, limit: number, dataType: ServiceResultDataType) {
        const { skip, take } = this.skipAndTake(page, limit);
        const repoResult = await this.repo!.offlineMessages(userId, userType, skip, take);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;

        let { items, totalRecords } = repoResult.data as any;
        items = items.length > 0 ? (items as any[]).map(item => ({ ...item, recipientOnline: true })) : items;

        const pagination = getPagination(page, limit, totalRecords);
        return super.responseData(dataType, 201, false, "Messages has been retrieved successfully", { items, pagination });
    }

    public async messages(room: { productId: number, vendorId: number, customerId: number }, page: number, limit: number) {

        const { skip, take } = this.skipAndTake(page, limit);
        const repoResult = await this.repo!.findChatMessages(room, skip, take);
        const repoResultError = super.handleRepoError(ServiceResultDataType.HTTP, repoResult);
        if (repoResultError) return repoResultError;

        let { items, totalRecords } = repoResult.data as any;
        const pagination = getPagination(page, limit, totalRecords);
        return super.responseData(ServiceResultDataType.HTTP, 200, false, "Messages has been retrieved successfully", { items: items.messages, pagination });
    }


    public async recentMessages(room: string, page: number = 1, limit: number = 10) {
        const cacheKey = `chat_${room}`;
        const cacheResult = await this.messagesCache.findCachedMessages(cacheKey);
        if (cacheResult.error) return super.responseData(ServiceResultDataType.HTTP, 500, true, "Internal Server Error");

        const cacheMessages = cacheResult.data as any[];
        const messages = cacheMessages.length > 0 ? cacheMessages.map(message => JSON.parse(message)) : [];
        if (messages.length > 0) return super.responseData(
            ServiceResultDataType.HTTP,
            200,
            false,
            "Cached recent messages has been retrieved successfully",
            messages
        );

        const { skip, take } = this.skipAndTake(page, limit);
        const [productId, vendorId, customerId] = room.split('_').map(id => Number(id));
        const repoResult = await this.repo!.findChatMessages({ productId, vendorId, customerId }, skip, take);
        const repoResultError = super.handleRepoError(ServiceResultDataType.HTTP, repoResult);
        if (repoResultError) return repoResultError;

        let { items, totalRecords } = repoResult.data as any;

        if (items.messages.length > 0) {
            try {
                await updateMessages.add('updateMessages', { messages: items.messages, room: cacheKey }, { jobId: `send-${Date.now()}`, priority: 1 });
                logger.info(`👍 updateMessages was successfully queued for room ${cacheKey}`);
            } catch (error) {
                console.error("🛑 Failed to queue updateMessages: ", error)
            }
        }

        return super.responseData(
            ServiceResultDataType.HTTP,
            200,
            false,
            "Recent messages has been retrieved successfully",
            items.messages
        );
    }

    // public async markMessagesAsRead(chatId: string, senderType: any, dataType: ServiceResultDataType) {
    //     const repoResult = await this.repo!.markMessagesAsRead(chatId, senderType);
    //     const repoResultError = super.handleRepoError(dataType, repoResult);
    //     if (repoResultError) return repoResultError;
    //     return super.responseData(dataType, 200, false, "Messages has been marked as read", repoResult.data);
    // }
}
