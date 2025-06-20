import Controller from "./bases/Controller";
import { Notification as NotificationService } from "../services";
import { Request, Response } from "express";
import { ServiceResultDataType } from "../types/enums";
import { HttpData } from "../types";


export default class Notification {

    private static readonly service: NotificationService = new NotificationService();

    public static async userNotifications(req: Request, res: Response) {
        Controller.handleValidationError(req, res);

        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const userId = Number(res.locals.data.id);
        const userType = res.locals.userType;


        const result = await Notification.service.userNotifications(ServiceResultDataType.HTTP,userId, userType, page, limit);
        Controller.response(res,result)
    }

    public static async offlineNotifications(req: Request, res: Response) {
        Controller.handleValidationError(req, res);

        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const userId = Number(res.locals.data.id);
        const userType = res.locals.userType;


        const result = await Notification.service.offlineNotifications(ServiceResultDataType.HTTP, userId, userType, page, limit) as HttpData;
        Controller.response(res, result)
    }
}