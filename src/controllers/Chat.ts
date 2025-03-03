import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { ChatManagementFacade } from "../facade";
import { CdnFolders, Namespace, ResourceType, UserType } from "../types/enums";
import { ServiceResult } from "../types";
import { Chat as ChatRepo, Message as MessageRepo } from "./../repos";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { Server } from "socket.io";
import Handler from "../handlers/Handler";
import { Cloudinary } from "../services";
import { logger } from "../config";
import { error } from "console";

export default class Chat {

    private static facade = new ChatManagementFacade();
    private static repo = new ChatRepo();
    private static message = new MessageRepo();
    private static cloudinary = new Cloudinary();

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
            const chatNamespace = io.of(Namespace.CHAT);

            let {
                recipientId,
                productId,
                text,
                storeName,
                customerName,
                storeLogoUrl,
                customerProfilePic,
                productPrice,
                productName,
                productImageUrl,
            } = req.body;

            recipientId = Number(recipientId);
            const [customerId, vendorId] = userType === UserType.Customer ? [userId, recipientId] : [recipientId, userId];
            const room = `chat_${productId}_${vendorId}_${customerId}`;

            const userSocket = await Chat.facade.getUserOnlineStatus(userType, String(userId));
            if (userSocket.error || !userSocket.data) {
                logger.error("Something went wrong,failed to get user online status")
                res.status(500).json({
                    error: true,
                    message: "Something went wrong,failed to get user online status",
                    data: {}
                });
                return;
            }

            const socketId = userSocket.data.chatSocketId;

            const recipientSocket = await Chat.facade.getRecipientOnlineStatus(userType, String(recipientId));
            if (recipientSocket.error) {
                logger.error("Something went wrong,failed to get recipient online status")
                res.status(500).json({
                    error: true,
                    message: "Something went wrong,failed to get recipient online status",
                    data: {}
                });
                return;
            }

            const recipientIsOnline = !!recipientSocket.data;
            const { uploadedFiles, failedFiles } = await Chat.cloudinary.upload(req.files as Express.Multer.File[], resourceType, folder);

            if (uploadedFiles.length > 0) {
                const publicIds = uploadedFiles.map((item: any) => item.publicId);

                let newMessage: TransactionMessage = {
                    senderId: userId,
                    text: text,
                    senderType: userType.toUpperCase(),
                    recipientOnline: recipientIsOnline
                };

                const repoResult = await Chat.repo.getChatWithRoomId(productId, customerId, vendorId);
                if (repoResult.error) {
                    res.status(500).json({
                        error: repoResult.error,
                        message: repoResult.message,
                        data: {}
                    });
                    return;
                }

                const chat = repoResult.data;
                if (chat) {
                    newMessage.chatId = chat.id;
                    const repoResult = await Chat.message.insertWithMedia(newMessage, uploadedFiles);
                    if (repoResult.error) {
                        await await Chat.cloudinary.deleteFiles(publicIds);
                        res.status(500).json({
                            error: true,
                            message: "Failed to create new message",
                            data: {}
                        });
                        return;
                    }

                    chatNamespace.to(room).emit('receiveMedia', Handler.responseData(200, false, null, repoResult.data));
                    res.status(201).json({
                        error: true,
                        message: "Message has been sent",
                        data: repoResult.data
                    });
                    return;
                } else {
                    if (!storeName || !customerName || !productPrice || !productName || !productImageUrl) {
                        await await Chat.cloudinary.deleteFiles(publicIds);

                        res.status(400).json({
                            error: true,
                            message: "Chat here",
                            data: "All fields are required to create a new chat"
                        });
                        return;
                    }

                    console.log(`💬 Creating new chat for room `);

                    const newChat: TransactionChat = {
                        storeName,
                        customerName,
                        customerId,
                        customerProfilePic,
                        vendorId,
                        storeLogoUrl,
                        productId,
                        productImageUrl,
                        productName,
                        productPrice
                    };

                    const repoResult = await Chat.repo.insertChatWithMessageAndMedias(newChat, newMessage, uploadedFiles);
                    if (repoResult.error) {
                        const deleted = Chat.cloudinary.deleteFiles(publicIds);
                        if (!deleted) {
                            res.status(500).json({
                                error: true,
                                message: "Something went wrong",
                                data: {}
                            });
                            return;
                        }

                        res.status(repoResult.type).json({
                            error: true,
                            message: repoResult.message,
                            data: repoResult.data
                        });
                        return;
                    }

                    const chat = repoResult.data;
                    chatNamespace.sockets.get(socketId)?.join(room);

                    if (recipientIsOnline) {
                        const recipientSocketId = recipientSocket.data.chatSocketId;
                        chatNamespace.sockets.get(recipientSocketId)?.join(room); //💬 Forcing the the recipient to join the room 
                        chatNamespace.sockets.get(recipientSocketId)?.emit('newChat', Handler.responseData(200, false, chat));
                        console.log(`✅ Message sent directly to user ${recipientId} via socket ${recipientSocketId}`);
                    }

                    chatNamespace.to(room).emit('receiveMedia', Handler.responseData(200, false, null, repoResult.data));

                    res.status(201).json({
                        error: false,
                        message: "New chat has been created",
                        data: repoResult.data
                    });
                    return;
                }
            }

            Controller.rawResponse(res, 500, true, "Something went wrong", failedFiles);
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
        const userType = res.locals.data.userType;
        const facadeResult = await Chat.facade.httpGetUserChats(userId, userType);
        Controller.response(res, facadeResult);
    }

    public static async getChat(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const productId = req.params.productId;
        const customerId = Number(req.params.customerId);
        const vendorId = Number(req.params.vendorId);

        const facadeResult = await Chat.repo.getChatWithRoomId(productId, customerId, vendorId);
        res.status(facadeResult.type).json({
            error: facadeResult.error,
            message: facadeResult.message,
            data: facadeResult.data
        })
    }

    public static async deleteMessage(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const messageId = req.params.messageId;
        const facadeResult = await Chat.facade.httpDeleteMessage(messageId);
        Controller.response(res, facadeResult);
    }
}