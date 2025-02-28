import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { ChatManagementFacade } from "../facade";
import { UserType } from "../types/enums";
import { ServiceResult } from "../types";

export default class Chat {

    private static facade = new ChatManagementFacade();

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