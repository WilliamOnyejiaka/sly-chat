import constants, { http, urls } from "../constants";
import { Chat as ChatRepo, Message as MessageRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";
import { UploadedFiles } from "../types";
import { TransactionMessage } from "../types/dtos";


export default class Message extends BaseService<MessageRepo> {

    public constructor() {
        super(new MessageRepo())
    }

    public async createMessage(userId: number, text: string, chatId: string, recipientOnline: boolean, senderType: any, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.insert({ senderId: userId, text, chatId, recipientOnline, senderType });
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

    public async deleteMessage(messageId: string, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.deleteWithId(messageId);
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

    public async markMessagesAsRead(chatId: string, senderType: any, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.markMessagesAsRead(chatId, senderType);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 200, false, "Messages has been marked as read", repoResult.data);
    }
}
