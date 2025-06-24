import prisma from ".";
import Repo from "./bases/Repo";
import { TransactionMessage } from "../types/dtos";
import { UserType } from "../types/enums";
import { TrustProductsChannelEndpointAssignmentContextImpl } from "twilio/lib/rest/trusthub/v1/trustProducts/trustProductsChannelEndpointAssignment";

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

    private messageSelect = {
        id: true,
        senderId: true,
        recipientId: true,
        text: true,
        timestamp: true,
        recipientOnline: true,
        chatId: true,
        senderType: true,
        recipientType: true,
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
    };

    public constructor() {
        super('message');
    }

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

    public async findChatMessages(room: { productId: number, vendorId: number, customerId: number }, skip: number, take: number) {
        try {
            const data = await this.prisma.$transaction(async (tx) => {
                const items = await tx.chat.findUnique({
                    where: {
                        productId_vendorId_customerId: room,
                    },
                    include: {
                        messages: {
                            skip,
                            take,
                            select: this.messageSelect,
                            orderBy: { updatedAt: 'desc' }
                        }
                    }
                });

                let totalRecords = 0

                if (items && items.messages.length > 0) {
                    const chatId = items.messages[0].chatId;
                    totalRecords = await tx.message.count({ where: { chatId: chatId } })
                }
                return { items, totalRecords };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async deleteMessage(id: string, userId: number, userType: string) {
        try {
            const data = await this.prisma.message.delete({
                where: {
                    id: id,
                    senderId: userId,
                    senderType: userType as any
                }
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }
}