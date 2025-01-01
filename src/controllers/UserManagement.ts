import { Request, Response } from "express";
import { UserManagementFacade } from "../facade";
import { UserType } from "../types/enums";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";

export default class UserManagement {

    private static readonly facade: UserManagementFacade = new UserManagementFacade();
    public static user: UserType;

    public static async getVendor(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const userId = Number(req.params.userId);
        console.log(UserManagement.user);
        
        const serviceResult = await UserManagement.facade.getUserProfileWithId(userId, UserManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const userId = Number(req.params.userId);
        const serviceResult = await UserManagement.facade.deleteUser(userId, UserManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async paginateVendors(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const page = Number(req.query.page);
        const pageSize = Number(req.query.pageSize);

        const serviceResult = await UserManagement.facade.paginateUsers(page, pageSize, UserManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllVendors(req: Request, res: Response) {
        const serviceResult = await UserManagement.facade.getAllUsers(UserManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async totalRecords(req: Request, res: Response) {
        const serviceResult = await UserManagement.facade.totalUsers(UserManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static toggleActivate(activate: boolean = true) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const userId = Number(req.body.userId);
            const serviceResult = activate ? await UserManagement.facade.activateUser(userId, UserManagement.user) : await UserManagement.facade.deactivateUser(userId, UserManagement.user);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static deactivateVendor() {
        return UserManagement.toggleActivate(false);
    }

    public static activateVendor() {
        return UserManagement.toggleActivate();
    }
}
