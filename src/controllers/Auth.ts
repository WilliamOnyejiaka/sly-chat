import { Request, Response } from "express";
import VendorDto, { CustomerAddressDto } from "./../types/dtos";
import { validationResult } from "express-validator";
import { Controller } from ".";
import { AuthenticationManagementFacade } from "../facade";
import { UserType } from "../types/enums";

export default class Auth {

    private static readonly facade: AuthenticationManagementFacade = new AuthenticationManagementFacade();

    public static async vendorSignUp(req: Request, res: Response) {
        const vendorDto: VendorDto = req.body;
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const serviceResult = await Auth.facade.vendorSignUp(vendorDto);
        Controller.response(res, serviceResult);
    }

    public static login(user: string) {
        return async (req: Request, res: Response) => {
            const { email, password } = req.body;
            const serviceResult = await Auth.facade.login(
                email as string,
                password as string,
                user as UserType
            );

            Controller.response(res, serviceResult);
        }
    }

    public static sendUserOTP(user: string) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Auth.facade.sendUserOTP(req.params.email, user as UserType);
            Controller.response(res, serviceResult);
        }
    }

    public static emailVerification(user: string) {
        return async (req: Request, res: Response) => {
            const serviceResult = await Auth.facade.emailVerification(req.params.email, req.params.otpCode, user as UserType);
            Controller.response(res, serviceResult);
        }
    }

    public static async customerSignUp(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const addressDto: CustomerAddressDto = {
            zip: req.body.zip,
            street: req.body.street,
            city: req.body.city
        }

        const serviceResult = await Auth.facade.customerSignUp({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber
        }, addressDto);
        Controller.response(res, serviceResult);
    }

    public static async logOut(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }
        const token = req.headers.authorization!.split(' ')[1];
        const serviceResult = await Auth.facade.logOut(token);
        Controller.response(res, serviceResult);
    }

    public static async adminSignUp(req: Request, res: Response) {
        const serviceResult = await Auth.facade.adminSignUp(req.body);
        Controller.response(res, serviceResult);
    }
}