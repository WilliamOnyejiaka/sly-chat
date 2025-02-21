import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { UserManagementFacade } from "../facade";
import { UserType } from "../types/enums";

export default class User {

    private static facade = new UserManagementFacade();

    public static createUser(userType: UserType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const facadeResult = await User.facade.createUser(req.body, userType);
            Controller.response(res, facadeResult);
        }
    }

    public static createVendor() {
        return User.createUser(UserType.Vendor);
    }

    public static createCustomer() {
        return User.createUser(UserType.Customer);
    }

}