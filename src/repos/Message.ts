import { Prisma } from "@prisma/client";
import prisma from ".";
import Repo from "./bases/Repo";

export default class Message extends Repo {

    public constructor() {
        super('message');
    }

    public override async insert(data: any) {
        try {
            const newItem = await prisma.message.create({
                data: data
            });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async markMessagesAsRead(chatId: string, senderId: string) {
        try {
            const updatedMessages = await prisma.message.updateMany({
                where: {
                    chatId: chatId,
                    senderId: { not: senderId }, // Messages from the other user
                    read: false, // Only update unread messages
                },
                data: {
                    read: true,
                },
            });

            return this.repoResponse(false, 201, null, updatedMessages);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

}