import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { ProductComment } from "../services";
import { CdnFolders, Namespace, ResourceType } from "../types/enums";
import { TransactionChat, TransactionMessage } from "../types/dtos";
import { Server } from "socket.io";
import Handler from "../handlers/Handler";
import { userIds, getRoom } from "../utils";

export default class Comment {

    private static service = new ProductComment();

    public static async createProductComment(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const userId = res.locals.data.id as number;
        const userType = res.locals.userType as string;
        const { content, productId, parentId } = req.body;
        const serviceResult = await Comment.service.createComment({
            content: content as string,
            userId,
            userType: userType.toUpperCase(),
            productId: productId as number,
            parentId
        });

        Controller.response(res, serviceResult);
    }

    public static async getWithId(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const id = req.params.id;
        const depth = parseInt(req.query.depth as string) || 5;
        const result = await Comment.service.getWithId(id, depth);
        Controller.response(res, result);
    }

    public static async paginate(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const depth = parseInt(req.query.depth as string) || 5;
        const result = await Comment.service.paginateComments(page, limit, depth);
        Controller.response(res, result);
    }
}