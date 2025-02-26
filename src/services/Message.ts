import constants, { http, urls } from "../constants";
import { Chat as ChatRepo, Message as MessageRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";

export default class Message extends BaseService<MessageRepo> {

    public constructor() {
        super(new MessageRepo())
    }

    public async deleteMessage(messageId: string) {
        const repoResult = await this.repo!.deleteWithId(messageId);
        const repoResultError = super.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(200, false, "Message has been deleted successfully");
    }

    public async updateOfflineMessages(chatIds: any[], userId: string, userType: UserType, dataType: ServiceResultDataType) {
        const updateOfflineMessagesRepoResult = await this.repo!.updateOfflineMessages(chatIds, userId, userType);
        const updateOfflineMessagesRepoResultError = super.handleRepoError(dataType, updateOfflineMessagesRepoResult);
        if (updateOfflineMessagesRepoResultError) return updateOfflineMessagesRepoResultError;
        return super.responseData(dataType, 200, false, "Messages has been updated successfully", updateOfflineMessagesRepoResult.data);
    }
}