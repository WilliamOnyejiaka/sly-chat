import constants, { http, urls } from "../constants";
import { Chat as ChatRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";
import { TransactionChat, TransactionMessage } from "../types/dtos";

export default class Chat extends BaseService<ChatRepo> {

    public constructor() {
        super(new ChatRepo())
    }

    public async createChatWithMessage(newChat: TransactionChat, newMessage: TransactionMessage, dataType: ServiceResultDataType) {
        const newChatResult = await this.repo!.insertChatWithMessage(newChat, newMessage);
        const newChatResultError = super.handleRepoError(dataType, newChatResult);
        if (newChatResultError) return newChatResultError;
        return super.responseData(dataType, 201, false, "Chat has been created successfully", newChatResult.data);
    }

    public async getUserChats(userId: number, userType: UserType, dataType: ServiceResultDataType) {
        const repoResult = await (userType == UserType.Customer ? this.repo!.getCustomerChatsWithMessages(userId) : this.repo!.getVendorChatsWithMessages(userId));
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;

        return super.responseData(dataType, 200, false, "Chats has been retrieved successfully", repoResult.data);
    }

    public async getChat(chatId: string, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.getChatWithMessages({ id: chatId })
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;

        return super.responseData(dataType, 200, false, "Chats has been retrieved successfully", repoResult.data);
    }

    public async getUserChatsWithMessages(userId: number, userType: UserType, dataType: ServiceResultDataType) {
        const repoResult = userType === UserType.Customer
            ? await this.repo!.getCustomerChatsWithMessages(userId)
            : await this.repo!.getVendorChatsWithMessages(userId);

        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 200, false, "Chats and messages has been retrieved successfully", repoResult.data);
    }

    public async getChatIds(userId: number,userType: UserType,dataType: ServiceResultDataType){
        const repoResult = await this.repo!.getChatIds(userId,userType);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 200, false, "Chat ids has been retrieved successfully", repoResult.data);
    }
}