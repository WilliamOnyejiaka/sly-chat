import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { ChatManagementFacade } from "../facade";
import { CdnFolders, ResourceType, UserType } from "../types/enums";
import { ServiceResult } from "../types";
import { cloudinary } from "../config";
import { compressImage } from "../utils";
import { Chat as ChatRepo, Message as MessageRepo } from "./../repos";
import { TransactionMessage } from "../types/dtos";

export default class Chat {

    private static facade = new ChatManagementFacade();
    private static repo = new ChatRepo();
    private static message = new MessageRepo();

    public static async sendPdf1(req: Request, res: Response) {
        try {
            if (!req.file) {
                res.status(400).json({ error: "No file uploaded" });
                return;
            }

            // Convert the file buffer to a Cloudinary stream
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "raw", folder: "chat-cdn/chat-pdfs" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file!.buffer); // Send the file buffer to Cloudinary
            });

            const { chatId, senderId } = req.body;
            const fileUrl = (result as any).secure_url; // Cloudinary URL

            res.status(201).json({ chatId, senderId, fileUrl });
        } catch (error: any) {
            console.error("Upload failed:", error);
            res.status(500).json({ error: "File upload failed", details: error.message });
        }
    }

    public static async upload(files: Express.Multer.File[], resourceType: ResourceType, folder: CdnFolders) {
        const uploadedFiles: any = [];
        const failedFiles: any = [];

        await Promise.all(
            files.map(async (file) => {
                try {
                    const buffer = resourceType === ResourceType.IMAGE ? await compressImage(file) : { error: false, buffer: file.buffer };
                    if (!buffer.error) {
                        const result: any = await new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { resource_type: resourceType, folder: folder, timeout: 100000 },
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve(result);
                                }
                            );
                            stream.end(buffer.buffer);
                        });
                        const url = resourceType === ResourceType.IMAGE ? cloudinary.url(result.public_id, {
                            transformation: [
                                { fetch_format: 'auto' },
                                { quality: 'auto' }
                            ]
                        }) : result.url;
                        result.url = url;
                        uploadedFiles.push({
                            publicId: result.public_id,
                            size: String(result.bytes),
                            imageUrl: result.url,
                            mimeType: file.mimetype
                        });
                    } else {
                        failedFiles.push({ filename: file.originalname, error: "Failed to compress image." });
                    }
                } catch (error: any) {
                    console.error(`Upload failed for ${file.originalname}:`, error);
                    failedFiles.push({ filename: file.originalname, error: error.message });
                }
            })
        );

        return { uploadedFiles, failedFiles }
    }

    public static async sendPdf(req: Request, res: Response) {
        try {
            if (!req.files) {
                res.status(400).json({
                    error: true,
                    message: "No file uploaded",
                    data: {}
                });
                return;
            }

            const { chatId, senderId } = req.body;
            const { uploadedFiles, failedFiles } = await Chat.upload(req.files as Express.Multer.File[], ResourceType.PDF, CdnFolders.PDF);


            res.status(201).json({ chatId, senderId, uploadedFiles, failedFiles });
        } catch (error: any) {
            console.error("Upload failed:", error);
            res.status(500).json({ error: "File upload failed", details: error.message });
        }
    }

    public static async sendImage(req: Request, res: Response) {
        try {
            if (!req.files || !Array.isArray(req.files)) {
                res.status(400).json({
                    error: true,
                    message: "No file uploaded",
                    data: {}
                });
                return;
            }

            if (req.files.length > 3) {
                res.status(400).json({
                    error: true,
                    message: "File limit has been exceeded.Maximum file limit is 3.",
                    data: {}
                });
                return;
            }

            let { chatId, senderId, text } = req.body;
            senderId = Number(senderId);

            const { uploadedFiles, failedFiles } = await Chat.upload(req.files, ResourceType.IMAGE, CdnFolders.IMAGE);

            if (uploadedFiles.length > 0) {
                let newMessage: TransactionMessage = {
                    senderId: senderId,
                    text: text,
                };
                if (chatId) {
                    newMessage.chatId = chatId;
                    const repoResult = await Chat.message.insertWithMedia(newMessage, uploadedFiles);
                    if (repoResult.error) {
                        res.status(500).json({
                            error: true,
                            message: "Failed to create",
                            data: {}
                        });
                        return;
                    }
                    res.status(201).json({
                        error: true,
                        message: "Created",
                        data: repoResult.data
                    });
                    return;
                } else {
                    // const repoResult = await Chat.repo.insertChatWithMessageAndMedias()

                    res.status(201).json({
                        error: true,
                        message: "Chat here",
                        data: "repoResult.data"
                    });
                    return;
                }
            }


            res.status(201).json({ chatId, senderId, uploadedFiles, failedFiles });
            return;
        } catch (error: any) {
            console.error("Upload failed:", error);
            res.status(500).json({ error: "File upload failed", details: error.message });
            return;
        }
    }

    public static async sendVideo(req: Request, res: Response) {
        try {
            req.setTimeout(600000); // 10 minutes timeout
            if (!req.files || !Array.isArray(req.files)) {
                res.status(400).json({
                    error: true,
                    message: "No file uploaded",
                    data: {}
                });
                return;
            }

            if (req.files.length > 3) {
                res.status(400).json({
                    error: true,
                    message: "File limit has been exceeded.Maximum file limit is 3.",
                    data: {}
                });
                return;
            }

            const { chatId, senderId } = req.body;
            const { uploadedFiles, failedFiles } = await Chat.upload(req.files, ResourceType.VIDEO, CdnFolders.VIDEO);

            res.status(201).json({ chatId, senderId, uploadedFiles, failedFiles });
            return;
        } catch (error: any) {
            console.error("Upload failed:", error);
            res.status(500).json({ error: "File upload failed", details: error.message });
            return;
        }
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

        const chatId = req.params.chatId;
        const facadeResult = await Chat.facade.httpGetChat(chatId);
        Controller.response(res, facadeResult as ServiceResult);
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