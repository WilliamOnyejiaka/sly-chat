import { Prisma } from "@prisma/client";
import prisma from ".";
import Repo from "./bases/Repo";

export default class Chat extends Repo {

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

    // public async insertChatWithMessage(newChat: any, newMessage: any) {
    //     try {
    //         const newItem = await prisma.chat.create({
    //             data: {
    //                 sellerId: newChat.sellerId,
    //                 productId: newChat.productId,
    //                 productImageUrl: newChat.productImageUrl,
    //                 storeLogoUrl: newChat.storeLogoUrl,
    //                 storeName: newChat.storeName,
    //                 buyerImgUrl: newChat.buyerImgUrl,
    //                 buyerId: newChat.buyerId,
    //                 buyerName: newChat.buyerName,
    //                 productName: newChat.productName,
    //                 productPrice: newChat.productPrice,
    //                 messages: {
    //                     create: {
    //                         text: newMessage.text,
    //                         senderId: newMessage.senderId
    //                     },
    //                 },
    //             },
    //             include: {
    //                 messages: {
    //                     select: {
    //                         senderId: true,
    //                         text: true,
    //                         timestamp: true,
    //                         read: true,
    //                         chatId: true
    //                     }
    //                 }
    //             }
    //         });
    //         return this.repoResponse(false, 201, null, newItem);
    //     } catch (error) {
    //         return this.handleDatabaseError(error);
    //     }
    // }

    public async insertChatWithMessage(newChat: any, newMessage: any) {
        try {
            const newItem = await prisma.chat.create({
                data: {
                    sellerId: newChat.sellerId,
                    productId: newChat.productId,
                    productImageUrl: newChat.productImageUrl,
                    storeLogoUrl: newChat.storeLogoUrl,
                    storeName: newChat.storeName,
                    buyerImgUrl: newChat.buyerImgUrl,
                    buyerId: newChat.buyerId,
                    buyerName: newChat.buyerName,
                    productName: newChat.productName,
                    productPrice: newChat.productPrice,
                    messages: {
                        create: {
                            text: newMessage.text,
                            senderId: newMessage.senderId
                        },
                    },
                },
                include: {
                    messages: {
                        select: {
                            senderId: true,
                            text: true,
                            timestamp: true,
                            read: true,
                            chatId: true
                        }
                    }
                }
            });
            return this.repoResponse(false, 201, null, newItem);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getSellerChatsWithMessages(sellerId: any) {
        try {
            const items = await prisma.chat.findMany({
                where: {
                    sellerId: sellerId
                },
                include: {
                    messages: {
                        select: {
                            senderId: true,
                            text: true,
                            timestamp: true,
                            read: true
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, items);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async getBuyerChatsWithMessages(buyerId: any) {
        try {
            const items = await prisma.chat.findMany({
                where: {
                    buyerId: buyerId
                },
                include: {
                    messages: {
                        select: {
                            senderId: true,
                            text: true,
                            timestamp: true,
                            read: true
                        }
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
                        select: {
                            senderId: true,
                            text: true,
                            timestamp: true,
                            read: true
                        }
                    }
                }
            });
            return this.repoResponse(false, 200, null, items);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}