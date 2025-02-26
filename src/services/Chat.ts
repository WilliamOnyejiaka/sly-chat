import constants, { http, urls } from "../constants";
import { Chat as ChatRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";

export default class Chat extends BaseService<ChatRepo> {

    public constructor() {
        super(new ChatRepo())
    }

    public async getUserChats(userId: string, userType: UserType) {
        const repoResult = await (userType == UserType.Customer ? this.repo!.getCustomerChatsWithMessages(userId) : this.repo!.getVendorChatsWithMessages(userId));
        const repoResultError = super.httpHandleRepoError(reportError);
        if (repoResultError) return repoResultError;

        return super.httpResponseData(200, false, "Chats has been retrieved successfully", repoResult.data);
    }

    public async getChat(publicId: string) {
        const repoResult = await this.repo!.getChatWithMessages({ publicId })
        const repoResultError = super.httpHandleRepoError(reportError);
        if (repoResultError) return repoResultError;

        return super.httpResponseData(200, false, "Chats has been retrieved successfully", repoResult.data);
    }

    public async getUserChatsWithMessages(userId: string, userType: UserType, dataType: ServiceResultDataType) {
        const repoResult = userType === UserType.Customer
            ? await this.repo!.getCustomerChatsWithMessages(userId)
            : await this.repo!.getVendorChatsWithMessages(userId);

        const repoResultError = super.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(dataType, 200, false, "Chats and messages has been retrieved successfully", repoResult.data);
    }
}