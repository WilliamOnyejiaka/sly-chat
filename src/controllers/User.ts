import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Controller from "./bases/Controller";
import { UserType } from "../types/enums";
import { User as UserService } from "./../services";
import { UserDto } from "../types/dtos";

export default class User {

    private static service = new UserService();

    private static createUser(userType: UserType) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }

            const newUser: UserDto = req.body;
            newUser.userType = userType.toUpperCase();

            const serviceResult = await User.service.createUser(newUser);
            Controller.response(res, serviceResult);
        }
    }

    public static createVendor() {
        return User.createUser(UserType.Vendor);
    }

    public static createCustomer() {
        return User.createUser(UserType.Customer);
    }

}