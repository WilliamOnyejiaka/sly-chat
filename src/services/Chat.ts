import constants, { http, urls } from "../constants";
import { Chat as ChatRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { UserType } from "../types/enums";

export default class Chat extends BaseService<ChatRepo> {

    public constructor() {
        super(new ChatRepo())
    }

    public async getUserChats(userId: string, userType: UserType) {
        const repoResult = await (userType == UserType.Customer ? this.repo!.getBuyerChatsWithMessages(userId) : this.repo!.getSellerChatsWithMessages(userId));
        const repoResultError = super.handleRepoError(reportError);
        if (repoResultError) return repoResultError;

        return super.responseData(200, false, "Chats has been retrieved successfully", repoResult.data);
    }

    public async getChat(publicId: string) {
        const repoResult = await this.repo!.getChatWithMessages({ publicId })
        const repoResultError = super.handleRepoError(reportError);
        if (repoResultError) return repoResultError;

        return super.responseData(200, false, "Chats has been retrieved successfully", repoResult.data);
    }
}