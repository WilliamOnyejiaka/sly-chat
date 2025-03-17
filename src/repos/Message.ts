import prisma from ".";
import Repo from "./bases/Repo";
import { TransactionMessage } from "../types/dtos";

export default class Message extends Repo {

    public constructor() {
        super('message');
    }

    // public override async insert(data: any) {
    //     try {
    //         const newItem = await prisma.message.create({
    //             data: data
    //         });
    //         return this.repoResponse(false, 201, null, newItem);
    //     } catch (error) {
    //         return this.handleDatabaseError(error);
    //     }
    // }

    public async insert(newMessage: any) {
        try {
            const [message] = await prisma.$transaction([
                prisma.message.create({
                    data: {
                        text: newMessage.text,
                        senderId: newMessage.senderId,
                        recipientOnline: newMessage.recipientOnline,
                        senderType: newMessage.senderType,
                        chatId: newMessage.chatId,
                    }
                }),
                prisma.chat.update({
                    where: { id: newMessage.chatId! },
                    data: { lastMessageAt: new Date() },
                }),
            ]);

            return this.repoResponse(false, 201, null, message);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async insertWithMedia(newMessage: TransactionMessage, medias: any) {
        try {
            const [message] = await prisma.$transaction([
                prisma.message.create({
                    data: {
                        text: newMessage.text,
                        senderId: newMessage.senderId,
                        recipientOnline: newMessage.recipientOnline,
                        senderType: newMessage.senderType,
                        chatId: newMessage.chatId,
                        messageMedias: {
                            createMany: {
                                data: medias
                            }
                        }
                    },
                    include: {
                        messageMedias: {
                            select: {
                                id: true,
                                url: true,
                                size: true,
                                mimeType: true,
                                thumbnail: true,
                                duration: true
                            }
                        }
                    }
                }),
                prisma.chat.update({
                    where: { id: newMessage.chatId! },
                    data: { lastMessageAt: new Date() },
                }),
            ]);

            return this.repoResponse(false, 201, null, message);
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
                    senderType: { not: userType as any },
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