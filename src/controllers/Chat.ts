import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { ChatManagementFacade } from "../facade";
import { UserType } from "../types/enums";
import { ServiceResult } from "../types";
import { cloudinary } from "../config";
import sharp from "sharp";

export default class Chat {

    private static facade = new ChatManagementFacade();

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

    public static async sendPdf(req: Request, res: Response) {
        try {
            if (!req.files) {
                res.status(400).json({ error: "No file uploaded" });
                return;
            }

            const { chatId, senderId } = req.body;
            const uploadedFiles: any = [];
            const failedFiles = [];

            await Promise.all(
                (req.files as Express.Multer.File[]).map(async (file) => {
                    try {
                        const result = await new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { resource_type: "raw", folder: "chat-cdn/chat-pdfs" },
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve(result);
                                }
                            );
                            stream.end(file.buffer);
                        });
                        uploadedFiles.push(result);
                    } catch (error: any) {
                        console.error(`Upload failed for ${file.originalname}:`, error);
                        failedFiles.push({ filename: file.originalname, error: error.message });
                    }
                })
            );

            res.status(201).json({ chatId, senderId, uploadedFiles });
        } catch (error: any) {
            console.error("Upload failed:", error);
            res.status(500).json({ error: "File upload failed", details: error.message });
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