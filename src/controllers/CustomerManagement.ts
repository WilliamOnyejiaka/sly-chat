import { Request, Response } from "express";
import { UserType } from "../types/enums";
import { UserManagementFacade } from "../facade";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";

export default class CustomerManagement {

    private static readonly facade: UserManagementFacade = new UserManagementFacade();
    private static readonly user: UserType = UserType.Customer;

    public static async getCustomer(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const customerId = Number(req.params.customerId);
        const serviceResult = await CustomerManagement.facade.getUserProfileWithId(customerId, CustomerManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const customerId = Number(req.params.customerId);
        const serviceResult = await CustomerManagement.facade.deleteUser(customerId, CustomerManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async paginateCustomers(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const page = Number(req.query.page);
        const pageSize = Number(req.query.pageSize);

        const serviceResult = await CustomerManagement.facade.paginateUsers(page, pageSize, CustomerManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllCustomers(req: Request, res: Response) {
        const serviceResult = await CustomerManagement.facade.getAllUsers(CustomerManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async totalRecords(req: Request, res: Response) {
        const serviceResult = await CustomerManagement.facade.totalUsers(CustomerManagement.user);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static toggleActivate(activate: boolean = true) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const customerId = Number(req.body.customerId);
            const serviceResult = activate ? await CustomerManagement.facade.activateUser(customerId, CustomerManagement.user) : await CustomerManagement.facade.deactivateUser(customerId, CustomerManagement.user);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static deactivateCustomer() {
        return CustomerManagement.toggleActivate(false);
    }

    public static activateCustomer() {
        return CustomerManagement.toggleActivate();
    }
}
