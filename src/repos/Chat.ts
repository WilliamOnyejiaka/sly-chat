import { Prisma } from "@prisma/client";
import prisma from ".";
import Repo from "./bases/Repo";
import { TransactionChat } from "../types/dtos";

export default class Chat extends Repo {

    private messageSelect = {
        senderId: true,
        text: true,
        timestamp: true,
        read: true,
        recipientOnline: true,
        chatId: true,
        senderType: true,
        messageImages: true
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
            const newItem = await prisma.chat.create({
                data: {
                    vendorId: newChat.vendorId,
                    productId: newChat.productId,
                    productImageUrl: newChat.productImageUrl,
                    storeLogoUrl: newChat.storeLogoUrl,
                    storeName: newChat.storeName,
                    customerProfilePic: newChat.customerProfilePic,
                    customerId: newChat.customerId,
                    customerName: newChat.customerName,
                    productName: newChat.productName,
                    productPrice: newChat.productPrice,
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
                        select: this.messageSelect
                    }
                }
            });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            console.log(error);

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
                        select: this.messageSelect
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
                include: {
                    messages: {
                        select: this.messageSelect
                    }
                }
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
                        select: this.messageSelect
                    }
                }
            });
            return this.repoResponse(false, 200, null, items);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}