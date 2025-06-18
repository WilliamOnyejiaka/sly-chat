import constants, { http, urls } from "../constants";
import { Chat as ChatRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { ChatLimit, ChatPagination, MessageLimit, MessagePagination, UploadedFiles } from "../types";
import { getPagination } from "../utils";

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

    public async createChatWithMedia(newChat: TransactionChat, newMessage: TransactionMessage, uploadedFiles: UploadedFiles[], dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.insertChatWithMessageAndMedias(newChat, newMessage, uploadedFiles);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 201, false, null, repoResult.data);
    }

    private paginateMessages(messages: any[], pagination: MessagePagination) {
        const totalRecords = messages.length;
        const paginationData = getPagination(pagination.page, pagination.limit, totalRecords);
        return paginationData;
    }

    public async getChatWithRoomId(productId: number, customerId: number, vendorId: number, pagination: MessagePagination, dataType: ServiceResultDataType) {
        const messageLimit: MessageLimit = this.messageLimit(pagination);
        const repoResult = await this.repo!.getChatWithRoomId(productId, customerId, vendorId, messageLimit);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        let data = repoResult.data as any;
        if (data && data.messages) {
            const messagePagination = this.paginateMessages(data.messages, pagination);
            data = { ...data, pagination: messagePagination }
        }
        return super.responseData(dataType, 201, false, "Chat has been retrieved successfully", data);
    }

    // public async getUserChats(userId: number, userType: UserType, dataType: ServiceResultDataType) {
    //     const repoResult = await (userType == UserType.Customer ? this.repo!.getCustomerChatsWithMessages(userId) : this.repo!.getVendorChatsWithMessages(userId));
    //     const repoResultError = super.handleRepoError(dataType, repoResult);
    //     if (repoResultError) return repoResultError;

    //     console.log(repoResult);


    //     return super.responseData(dataType, 200, false, "Chats has been retrieved successfully", repoResult.data);
    // }

    public async getChat(chatId: string, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.getChatWithMessages({ id: chatId })
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;

        return super.responseData(dataType, 200, false, "Chats has been retrieved successfully", repoResult.data);
    }

    public async getUserChatsWithMessages(userId: number, userType: UserType, pagination: ChatPagination, dataType: ServiceResultDataType) {
        const chatLimit: ChatLimit = this.chatLimit(pagination);
        const repoResult = userType === UserType.Customer
            ? await this.repo!.getCustomerChatsWithMessages(userId, chatLimit)
            : await this.repo!.getVendorChatsWithMessages(userId, chatLimit);

        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const items = data.items;
        const paginationData = getPagination(pagination.page, pagination.limit, totalRecords);
        return super.responseData(dataType, 200, false, "Chats and messages has been retrieved successfully", { items, pagination: paginationData });
    }

    public async getChatId(productId: number, customerId: number, vendorId: number) {
        const repoResult = await this.repo!.getChatId(productId, customerId, vendorId);
        const repoResultError = super.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data;

        return super.responseData(ServiceResultDataType.SOCKET, 200, false, null, { id: data ? (data as any).id : null });
    }

    public async getChatIds(userId: number, userType: UserType, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.getChatIds(userId, userType);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 200, false, "Chat ids has been retrieved successfully", repoResult.data);
    }

    public async deleteChat(chatId: string, userId: number, userType: string, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.deleteChat(chatId, userId, userType.toUpperCase());
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 200, false, "Chat has been deleted successfully");
    }
}