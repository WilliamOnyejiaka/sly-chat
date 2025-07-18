import constants, { http, urls } from "../constants";
import { Chat as ChatRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { ChatLimit, ChatPagination, MessageLimit, MessagePagination, SocketData, UploadedFiles } from "../types";
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

    public async loadChatsWithRooms(userId: number, userType: UserType, page: number, limit: number, dataType: ServiceResultDataType) {
        const user = userType === UserType.Customer ? { customerId: userId } : { vendorId: userId };
        const { skip, take } = this.skipAndTake(page, limit);

        const repoResult = await this.repo!.getChats(user, skip, take);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;

        let { items, totalRecords } = repoResult.data as any;
        const pagination = getPagination(page, limit, totalRecords);
        let rooms: string[] = [];
        if (items.length > 0) rooms = (items as any[]).map(item => `chat_${item.productId}_${item.vendorId}_${item.customerId}`);
        return super.responseData(dataType, 201, false, "Chats has been retrieved successfully", { items, pagination, rooms });
    }

    public async getUserChats(userId: number, userType: UserType, page: number, limit: number, dataType: ServiceResultDataType = ServiceResultDataType.HTTP) {
        const user = userType === UserType.Customer ? { customerId: userId } : { vendorId: userId };
        const { skip, take } = this.skipAndTake(page, limit);

        const repoResult = await this.repo!.getChats(user, skip, take);
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;

        let { items, totalRecords } = repoResult.data as any;
        const pagination = getPagination(page, limit, totalRecords);
        return super.responseData(dataType, 201, false, "Chats has been retrieved successfully", { items, pagination });
    }

    public async joinChat(
        productId: number,
        customerId: number,
        vendorId: number,
        pagination: MessagePagination,
        userType: UserType
    ) {
        const messageLimit: MessageLimit = this.messageLimit(pagination);
        const repoResult = await this.repo!.roomChat(productId, customerId, vendorId, messageLimit, userType);
        const repoResultError = super.handleRepoError(ServiceResultDataType.SOCKET, repoResult) as SocketData;
        if (repoResultError) return repoResultError;
        let { item, totalMessages } = repoResult.data as any;
        if (item && item.messages) {
            const messagePagination = getPagination(pagination.page, pagination.limit, totalMessages);
            item = { ...item, pagination: messagePagination }
        }
        return super.responseData(ServiceResultDataType.SOCKET, 200, false, "Chat has been retrieved successfully", item) as SocketData;
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

    public async unreadChats(userId: number, userType: UserType, page: number, limit: number) {
        const { skip, take } = this.skipAndTake(page, limit);
        const where = userType === UserType.Customer ? { customerId: userId, unReadCustomerMessages: true } : { vendorId: userId, unReadVendorMessages: true }
        const repoResult = await this.repo!.findUnreadChats(where, skip, take);
        const repoResultError = super.handleRepoError(ServiceResultDataType.HTTP, repoResult);
        if (repoResultError) return repoResultError;

        let { items, totalRecords } = repoResult.data as any;
        const pagination = getPagination(page, limit, totalRecords);
        return super.responseData(ServiceResultDataType.HTTP, 200, false, "Chats has been retrieved successfully", { items, pagination });
    }

    public async markAsRead(room: { productId: number, vendorId: number, customerId: number }, userType: UserType) {
        const [where, updatedData] = userType === UserType.Customer ? [{ unReadCustomerMessages: true }, { unReadCustomerMessages: false }] : [{ unReadVendorMessages: true }, { unReadVendorMessages: false }];
        const repoResult = await this.repo!.markAsRead(room, where, updatedData);
        const repoResultError = super.handleRepoError(ServiceResultDataType.SOCKET, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(ServiceResultDataType.SOCKET, 200, false, "Chats has been marked as read successfully", repoResult.data);
    }

    public async getChat(room: { productId: number, vendorId: number, customerId: number }) {
        const repoResult = await this.repo!.findChat(room);
        const repoResultError = super.handleRepoError(ServiceResultDataType.HTTP, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(ServiceResultDataType.HTTP, 200, false, "Chat has been retrieved successfully", repoResult.data);
    }

    public async deleteChat(chatId: string, userId: number, userType: string, dataType: ServiceResultDataType) {
        const repoResult = await this.repo!.deleteChat(chatId, userId, userType.toUpperCase());
        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 200, false, "Chat has been deleted successfully");
    }
}