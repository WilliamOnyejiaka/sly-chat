import { Prisma } from "@prisma/client";
import prisma from ".";
import Repo from "./bases/Repo";
import { UserType } from "../types/enums";

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

    public async markMessagesAsRead(chatId: string, userType: string) {
        try {
            const updatedMessages = await prisma.message.updateMany({
                where: {
                    chatId: chatId,
                    senderType: { not: userType as any },
                    read: false,
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

    public async updateOfflineMessages(chatIds: string[], userType: string) {
        try {
            const updatedMessages = await prisma.message.updateMany({
                where: {
                    chatId: { in: chatIds },
                    senderType: { not: userType as any},
                    recipientOnline: false,
                },
                data: {
                    recipientOnline: true,
                },
            });
            return this.repoResponse(false, 201, null, updatedMessages);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}