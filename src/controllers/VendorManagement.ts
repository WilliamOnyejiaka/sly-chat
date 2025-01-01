import { Request, Response } from "express";
import { UserManagementFacade } from "../facade";
import { UserType } from "../types/enums";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";

export default class VendorManagement {

    private static readonly facade: UserManagementFacade = new UserManagementFacade();
    private static readonly user: UserType = UserType.Vendor;

    public static async getVendor(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const vendorId = Number(req.params.vendorId);
        const serviceResult = await VendorManagement.facade.getUserProfileWithId(vendorId, VendorManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const vendorId = Number(req.params.vendorId);        
        const serviceResult = await VendorManagement.facade.deleteUser(vendorId, VendorManagement.user);
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

        const serviceResult = await VendorManagement.facade.paginateUsers(page, pageSize, VendorManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllVendors(req: Request, res: Response) {
        const serviceResult = await VendorManagement.facade.getAllUsers(VendorManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async totalRecords(req: Request, res: Response) {
        const serviceResult = await VendorManagement.facade.totalUsers(VendorManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static toggleActivate(activate: boolean = true) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const vendorId = Number(req.body.vendorId);
            const serviceResult = activate ? await VendorManagement.facade.activateUser(vendorId, VendorManagement.user) : await VendorManagement.facade.deactivateUser(vendorId, VendorManagement.user);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static deactivateVendor() {
        return VendorManagement.toggleActivate(false);
    }

    public static activateVendor() {
        return VendorManagement.toggleActivate();
    }
}
