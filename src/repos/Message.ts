import prisma from ".";
import Repo from "./bases/Repo";
import { TransactionMessage } from "../types/dtos";
import { UserType } from "../types/enums";

interface MessageDto {
    id?: string,
    senderId: number,
    text?: string,
    timestamp?: Date,
    read?: boolean,
    recipientOnline: boolean,
    chatId: string,
    createdAt: Date,
    updatedAt: Date
};

export default class Message extends Repo<MessageDto> {

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
            const data = await this.prisma.$transaction(async (tx): Promise<any> => {
                const message = await tx.message.create({
                    data: {
                        text: newMessage.text,
                        senderId: newMessage.senderId,
                        recipientOnline: newMessage.recipientOnline,
                        senderType: newMessage.senderType,
                        chatId: newMessage.chatId,
                        recipientType: newMessage.recipientType,
                        recipientId: newMessage.recipientId
                    }
                });

                await tx.chat.update({
                    where: { id: newMessage.chatId! },
                    data: { lastMessageAt: new Date() },
                });

                return message;
            });

            return this.repoResponse(false, 201, null, data);

            // const [message] = await prisma.$transaction([
            //     prisma.message.create({
            //         data: {
            //             text: newMessage.text,
            //             senderId: newMessage.senderId,
            //             recipientOnline: newMessage.recipientOnline,
            //             senderType: newMessage.senderType,
            //             chatId: newMessage.chatId,
            //         }
            //     }),
            //     prisma.chat.update({
            //         where: { id: newMessage.chatId! },
            //         data: { lastMessageAt: new Date() },
            //     }),
            // ]);

            // return this.repoResponse(false, 201, null, message);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }


    // public async insert(newMessage: any) {
    //     try {
    //         const [message] = await prisma.$transaction([
    //             prisma.message.create({
    //                 data: {
    //                     text: newMessage.text,
    //                     senderId: newMessage.senderId,
    //                     recipientOnline: newMessage.recipientOnline,
    //                     senderType: newMessage.senderType,
    //                     chatId: newMessage.chatId,
    //                 }
    //             }),
    //             prisma.chat.update({
    //                 where: { id: newMessage.chatId! },
    //                 data: { lastMessageAt: new Date() },
    //             }),
    //         ]);

    //         return this.repoResponse(false, 201, null, message);
    //     } catch (error) {
    //         return this.handleDatabaseError(error);
    //     }
    // }

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
                        recipientType: newMessage.recipientType,
                        recipientId: newMessage.recipientId,
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

    // public async markMessagesAsRead(chatId: string, userType: string) {
    //     try {
    //         const updatedMessages = await prisma.message.updateMany({
    //             where: {
    //                 chatId: chatId,
    //                 senderType: { not: userType as any },
    //             },
    //             data: {
    //                 read: true,
    //             },
    //         });
    //         return this.repoResponse(false, 201, null, updatedMessages);
    //     } catch (error) {
    //         return this.handleDatabaseError(error);
    //     }
    // }

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

    public async offlineMessages(userId: number, userType: UserType, skip: number, take: number) {
        try {
            const where = { recipientId: userId, recipientType: userType.toUpperCase() as any, recipientOnline: false };
            const data = await this.prisma.$transaction(async (tx) => {
                const items = await tx.message.findMany({
                    skip,
                    take,
                    where,
                    include: { chat: true },
                    orderBy: { createdAt: 'desc' } // Sort by creation date, newest first
                });

                let totalRecords = 0;

                if (items.length > 0) {
                    const messageIds = items.map(item => item.id);
                    totalRecords = await tx.message.count({ where });
                    await tx.message.updateMany({
                        where: { id: { in: messageIds } },
                        data: { recipientOnline: true }
                    });
                }

                return { items, totalRecords };
            });

            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async deleteMessage(id: string, userId: number, userType: string) {
        const where = userType === UserType.Customer.toUpperCase() ? { customerId: userId } : { vendorId: userId };
        return this.delete({
            id: id,
            ...where
        });
    }
}