import prisma from ".";
import Repo from "./bases/Repo";
import { TransactionChat } from "../types/dtos";
import { UserType } from "../types/enums";

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
    }


    public constructor() {
        super('supportChat');
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
            const newItem = await prisma.chat.create({
                data: {
                    vendorId: newChat.vendorId,
                    productId: newChat.productId,
                    productImageUrl: newChat.productImageUrl!,
                    storeLogoUrl: newChat.storeLogoUrl!,
                    storeName: newChat.storeName!,
                    customerProfilePic: newChat.customerProfilePic,
                    customerId: newChat.customerId,
                    customerName: newChat.customerName!,
                    productName: newChat.productName!,
                    productPrice: newChat.productPrice!,
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
                    }
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
                    productImageUrl: newChat.productImageUrl!,
                    storeLogoUrl: newChat.storeLogoUrl,
                    storeName: newChat.storeName!,
                    customerProfilePic: newChat.customerProfilePic,
                    customerId: newChat.customerId,
                    customerName: newChat.customerName!,
                    productName: newChat.productName!,
                    productPrice: newChat.productPrice!,
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
                    }
                }
            });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getVendorChatsWithMessages(userId: number) {
        try {
            const items = await prisma.chat.findMany({
                where: {
                    vendorId: userId
                },
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

    public async getChatWithRoomId(productId: string, customerId: number, vendorId: number) {
        try {
            const items = await prisma.chat.findFirst({
                where: { productId, customerId, vendorId },
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
    public async getCustomerChatsWithMessages(userId: number) {
        try {
            const items = await prisma.chat.findMany({
                where: {
                    customerId: userId
                },
                orderBy: { lastMessageAt: 'desc' },
                include: {
                    messages: {
                        select: this.messageSelect,
                        orderBy: { updatedAt: 'desc' },
                    }
                },

            });
            return this.repoResponse(false, 200, null, items);
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
}