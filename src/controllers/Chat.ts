import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { ChatManagementFacade } from "../facade";
import { CdnFolders, Namespaces, ResourceType, UserType } from "../types/enums";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { Server } from "socket.io";
import Handler from "../handlers/sockets/Handler";
import { userIds, getRoom } from "../utils";
import { updateChat } from "../config/bullMQ";
import { ChatPagination } from "../types";

export default class Chat {

    private static facade = new ChatManagementFacade();

    public static sendMedia(resourceType: ResourceType, folder: CdnFolders) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const userId = Number(res.locals.data.id);
            const userType = res.locals.userType;
            const io: Server = res.locals.io;
            const chatNamespace = io.of(Namespaces.CHAT);

            let {
                recipientId,
                productId,
                text,
                storeId
            } = req.body;

            recipientId = Number(recipientId);
            const { customerId, vendorId } = userIds(userId, recipientId, userType);
            const room = getRoom(productId, customerId, vendorId);
            const usersOnlineStatusResult = await Chat.facade.getUsersOnlineStatus(Number(userId), Number(recipientId), userType);
            if (usersOnlineStatusResult.error) {
                Controller.rawResponse(
                    res, usersOnlineStatusResult.statusCode,
                    usersOnlineStatusResult.error,
                    usersOnlineStatusResult.message
                );
                return;
            }

            const { userSocketId, recipientSocketId } = usersOnlineStatusResult.data;
            const recipientIsOnline = !!recipientSocketId;

            let newMessage: TransactionMessage = {
                senderId: userId,
                text: text,
                senderType: userType.toUpperCase(),
                recipientOnline: recipientIsOnline
            };

            const newChat: TransactionChat = {
                customerId,
                vendorId,
                productId: Number(productId),

            };
            const pagination: ChatPagination = {
                page: 1,
                limit: 10,
                message: {
                    page: 1,
                    limit: 10
                }
            };

            const facadeResult = await Chat.facade.createChatWithMedia(
                newChat,
                newMessage,
                req.files as Express.Multer.File[],
                resourceType,
                folder,
                pagination
            );

            if (facadeResult.json.error) {
                Controller.response(res, facadeResult);
                return;
            }

            const data = facadeResult.json.data;

            if (!data.isNewChat) {
                console.log(`🟡 Adding message to existing chat for room ${room}`);
                chatNamespace.to(room).emit('receiveMedia', Handler.responseData(200, false, null, data.message));
                res.status(201).json({
                    error: true,
                    message: "Message has been sent",
                    data: data.message
                });
                return;
            }

            console.log(`💬 Creating new chat for room `);
            chatNamespace.sockets.get(userSocketId)?.join(room);
            const chat = data.chat;
            const vendorProfile = chat.vendor;
            const customerProfile = chat.customer;
            delete chat.vendor;
            delete chat.customer;

            let senderChat;
            let recipientChat;
            if (userType === UserType.Customer) {
                senderChat = {
                    ...chat,
                    vendor: vendorProfile
                };
                recipientChat = {
                    ...chat,
                    customer: customerProfile
                };
            } else {
                senderChat = {
                    ...chat,
                    customer: customerProfile
                };
                recipientChat = {
                    ...chat,
                    vendor: vendorProfile
                };
            }

            chatNamespace.sockets.get(userSocketId)?.emit('newSentChat', Handler.responseData(200, false, null, senderChat));
            chatNamespace.to(room).emit('receiveMedia', Handler.responseData(200, false, null, data.chat.messages));
            if (recipientIsOnline) {
                chatNamespace.sockets.get(recipientSocketId)?.join(room); //💬 Forcing the the recipient to join the room 
                chatNamespace.sockets.get(recipientSocketId)?.emit('newChat', Handler.responseData(200, false, recipientChat));
                const recipientType = userType === UserType.Customer ? UserType.Vendor : UserType.Customer;
                await updateChat.add('updateChat', { recipientId, recipientType, recipientSocketId }, { jobId: `send-${Date.now()}`, priority: 1 });
                console.log(`✅ Message sent directly to user ${recipientId} via socket ${recipientSocketId}`);
            }
            res.status(201).json({
                error: false,
                message: "New chat has been created",
                data: senderChat
            });
            return;
        }
    }

    public static sendImage() {
        return Chat.sendMedia(ResourceType.IMAGE, CdnFolders.IMAGE);
    }

    public static sendVideo() {
        return Chat.sendMedia(ResourceType.VIDEO, CdnFolders.VIDEO);
    }

    public static sendPdf() {
        return Chat.sendMedia(ResourceType.PDF, CdnFolders.PDF);
    }

    public static async getUserChats(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const userId = res.locals.data.id;
        const userType = res.locals.userType;
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const messagePage = Number(req.query.messagePage);
        const messageLimit = Number(req.query.messageLimit);
        const pagination: ChatPagination = {
            page: page,
            limit: limit,
            message: {
                page: messagePage,
                limit: messageLimit
            }
        };
        const facadeResult = await Chat.facade.httpGetUserChats(userId, userType, pagination);
        Controller.response(res, facadeResult);
    }

    public static async getChat(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const productId = Number(req.params.productId);
        const customerId = Number(req.params.customerId);
        const vendorId = Number(req.params.vendorId);
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const messagePage = Number(req.query.messagePage);
        const messageLimit = Number(req.query.messageLimit);
        const pagination: ChatPagination = {
            page: page,
            limit: limit,
            message: {
                page: messagePage,
                limit: messageLimit
            }
        };

        const facadeResult = await Chat.facade.httpGetChatWithRoomId(productId, customerId, vendorId, pagination);
        Controller.response(res, facadeResult);
    }

    public static async deleteMessage(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const userType = res.locals.userType as string;
        const userId = Number(res.locals.data.id);
        const messageId = req.params.messageId;
        const facadeResult = await Chat.facade.httpDeleteMessage(messageId, userId, userType);
        Controller.response(res, facadeResult);
    }

    public static async deleteChat(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const userType = res.locals.userType as string;
        const userId = Number(res.locals.data.id);
        const id = req.params.id;
        const facadeResult = await Chat.facade.httpDeleteChat(id, userId, userType);
        Controller.response(res, facadeResult);
    }
}