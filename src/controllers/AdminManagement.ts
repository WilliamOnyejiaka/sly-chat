import { Request, Response } from "express";
import { UserManagementFacade } from "../facade";
import { UserType } from "../types/enums";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { AdminDto } from "../types/dtos";

export default class AdminManagement {

    private static readonly facade: UserManagementFacade = new UserManagementFacade();
    private static readonly user: UserType = UserType.Admin;

    public static async getAdmin(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const adminId = Number(req.params.adminId);
        const serviceResult = await AdminManagement.facade.getUserProfileWithId(adminId, AdminManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createAdmin(req: Request, res: Response) {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const createData: AdminDto = req.body;
        const createdBy = Number(res.locals.data.id); // ! TODO: get from cache
        const serviceResult = await AdminManagement.facade.createAdmin(createData, createdBy);
        Controller.response(res, serviceResult);
    }

    public static async generateSignUpKey(req: Request, res: Response) {
        const createdBy = Number(res.locals.data.id);
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const roleId = Number(req.params.roleId);
        const serviceResult = await AdminManagement.facade.generateAdminSignUpKey(roleId, createdBy);
        Controller.response(res, serviceResult);
    }


    public static async delete(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const adminId = Number(req.params.adminId);
        const serviceResult = await AdminManagement.facade.deleteUser(adminId, AdminManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async paginateAdmins(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const page = Number(req.query.page);
        const pageSize = Number(req.query.pageSize);

        const serviceResult = await AdminManagement.facade.paginateUsers(page, pageSize, AdminManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllAdmins(req: Request, res: Response) {
        const serviceResult = await AdminManagement.facade.getAllUsers(AdminManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async totalRecords(req: Request, res: Response) {
        const serviceResult = await AdminManagement.facade.totalUsers(AdminManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static toggleActivate(activate: boolean = true) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const adminId = Number(req.body.adminId);
            const serviceResult = activate ? await AdminManagement.facade.activateUser(adminId, AdminManagement.user) : await AdminManagement.facade.deactivateUser(adminId, AdminManagement.user);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static deactivateAdmin() {
        return AdminManagement.toggleActivate(false);
    }

    public static activateAdmin() {
        return AdminManagement.toggleActivate();
    }
}
