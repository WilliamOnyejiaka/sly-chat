import constants, { http, urls } from "../constants";
import { Chat as ChatRepo, Message as MessageRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { UserType } from "../types/enums";

export default class Message extends BaseService<MessageRepo> {

    public constructor() {
        super(new MessageRepo())
    }

    public async deleteMessage(messageId: string) {
        const repoResult = await this.repo!.deleteWithId(messageId);
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(200, false, "Message has been deleted successfully");
    }
}