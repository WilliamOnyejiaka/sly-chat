import { Chat, Message } from "../services";
import { UserType } from "../types/enums";
import BaseFacade from "./bases/BaseFacade";

export default class ChatManagementFacade extends BaseFacade {

    private readonly chatService = new Chat();
    private readonly messageService = new Message();

    public async getUserChats(userId: string, userType: UserType) {
        return await this.chatService.getUserChats(userId, userType);
    }

    public async getChat(publicId: string) {
        return await this.chatService.getChat(publicId);
    }

    public async deleteMessage(messageId: string) {
        return await this.messageService.deleteMessage(messageId);
    }

}

