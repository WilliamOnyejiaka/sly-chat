import { Prisma } from "@prisma/client";
import prisma from ".";
import Repo from "./bases/Repo";
import { TransactionChat } from "../types/dtos";
import { UserType } from "../types/enums";
import { ChatLimit, MessageLimit } from "../types";

export default class Chat extends Repo {

    private messageSelect = {
        id: true,
        senderId: true,
        text: true,
        timestamp: true,
        read: true,
        recipientOnline: true,
        chatId: true,
        senderType: true,
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
        super('chat');
    }

    public override async insert(data: any) {
        try {
            const newItem = await prisma.chat.create({
                data: data
            });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async insertChatWithMessage(newChat: TransactionChat, newMessage: any) {
        try {
            const newItem = await this.prisma.chat.create({
                data: {
                    vendorId: newChat.vendorId,
                    productId: newChat.productId,
                    customerId: newChat.customerId,
                    storeId: newChat.storeId,
                    messages: {
                        create: {
                            text: newMessage.text,
                            senderId: newMessage.senderId,
                            recipientOnline: newMessage.recipientOnline,
                            senderType: newMessage.senderType
                        },
                    },
                },
                include: {
                    messages: {
                        select: this.messageSelect,
                        orderBy: { updatedAt: 'desc' }
                    },
                    vendor: {
                        select: {
                            id: true,
                            userId: true,
                            firstName: true,
                            lastName: true,
                            profilePictureUrl: true,
                            email: true,
                            verified: true,
                            phoneNumber: true,
                            active: true,
                            createdAt: true,
                            updatedAt: true,
                            store: true
                        }
                    },
                    customer: true
                }
            });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async insertChatWithMessageAndMedias(newChat: TransactionChat, newMessage: any, medias: any) {
        try {
            const newItem = await prisma.chat.create({
                data: {
                    vendorId: newChat.vendorId,
                    productId: newChat.productId,
                    customerId: newChat.customerId,
                    storeId: newChat.storeId,
                    messages: {
                        create: {
                            text: newMessage.text,
                            senderId: newMessage.senderId,
                            recipientOnline: newMessage.recipientOnline,
                            senderType: newMessage.senderType,
                            messageMedias: {
                                createMany: {
                                    data: medias
                                }
                            }
                        },
                    },
                },
                include: {
                    messages: {
                        select: this.messageSelect,
                        orderBy: { updatedAt: 'desc' }
                    },
                    vendor: {
                        select: {
                            id: true,
                            userId: true,
                            firstName: true,
                            lastName: true,
                            profilePictureUrl: true,
                            email: true,
                            verified: true,
                            phoneNumber: true,
                            active: true,
                            createdAt: true,
                            updatedAt: true,
                            store: true
                        }
                    },
                    customer: true
                }
            });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getVendorChatsWithMessages(userId: number, pagination: ChatLimit) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = {
                    vendorId: userId
                };
                const items = await tx.chat.findMany({
                    skip: pagination.skip,
                    take: pagination.take,
                    where: where,
                    include: {
                        messages: {
                            ...pagination.message,
                            select: {
                                id: true,
                                senderId: true,
                                text: true,
                                timestamp: true,
                                read: true,
                                recipientOnline: true,
                                chatId: true,
                                senderType: true,
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
                            },
                            orderBy: { updatedAt: 'desc' }
                        },
                        customer: true
                    }
                });

                const totalItems = await tx.chat.count({ where: where })
                return { items, totalItems };
            });

            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
    public async getChatWithRoomId(productId: number, customerId: number, vendorId: number, pagination: MessageLimit) {
        try {
            const where = { productId, customerId, vendorId };

            const data = await this.prisma.chat.findFirst({
                where: where,
                include: {
                    messages: {
                        ...pagination,
                        select: {
                            id: true,
                            senderId: true,
                            text: true,
                            timestamp: true,
                            read: true,
                            recipientOnline: true,
                            chatId: true,
                            senderType: true,
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
                        },
                        orderBy: { updatedAt: 'desc' }
                    }
                }
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    // public async getChatWithRoomId(productId: number, customerId: number, vendorId: number) {
    //     try {
    //         const items = await prisma.chat.findFirst({
    //             where: { productId, customerId, vendorId },
    //             include: {
    //                 messages: {
    //                     select: this.messageSelect,
    //                     orderBy: { updatedAt: 'desc' }
    //                 }
    //             }
    //         });
    //         return this.repoResponse(false, 200, null, items);
    //     } catch (error) {
    //         return this.handleDatabaseError(error);
    //     }
    // }
    public async getCustomerChatsWithMessages(userId: number, pagination: ChatLimit) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{ items: any, totalItems: number }> => {
                const where = {
                    customerId: userId
                };
                const items = await tx.chat.findMany({
                    where: where,
                    skip: pagination.skip,
                    take: pagination.take,
                    orderBy: { lastMessageAt: 'desc' },
                    include: {
                        messages: {
                            ...pagination.message,
                            select: {
                                id: true,
                                senderId: true,
                                text: true,
                                timestamp: true,
                                read: true,
                                recipientOnline: true,
                                chatId: true,
                                senderType: true,
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
                            },
                            orderBy: { updatedAt: 'desc' }
                        },
                        vendor: {
                            select: {
                                id: true,
                                userId: true,
                                firstName: true,
                                lastName: true,
                                profilePictureUrl: true,
                                email: true,
                                verified: true,
                                phoneNumber: true,
                                active: true,
                                createdAt: true,
                                updatedAt: true,
                                store: true
                            }
                        }
                    },
                });
                const totalItems = await tx.chat.count({ where: where })
                return { items, totalItems };
            });

            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getChatIds(userId: number, userType: UserType) {
        const where = {
            [UserType.Customer]: { customerId: userId },
            [UserType.Vendor]: { vendorId: userId },
            [UserType.Admin]: {}
        };

        try {
            const items = await prisma.chat.findMany({
                where: where[userType],
                select: { id: true }
            });
            return this.repoResponse(false, 200, null, items);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }


    public async getChatWithMessages(where: any) {
        try {
            const items = await prisma.chat.findFirst({
                where: where,
                include: {
                    messages: {
                        select: this.messageSelect,
                        orderBy: { updatedAt: 'desc' }
                    }
                }
            });
            return this.repoResponse(false, 200, null, items);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async deleteChat(id: string, userId: number, userType: string) {
        const where = userType === UserType.Customer.toUpperCase() ? { customerId: userId } : { vendorId: userId };
        return this.delete({
            id: id,
            ...where
        });
    }
}