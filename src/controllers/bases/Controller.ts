import { Result, ValidationError } from "express-validator";
import BaseService from "../../services/bases/BaseService";
import { Request, Response } from "express";
import { ServiceResult } from "../../types";

export default class Controller {

    public static paginate<T extends BaseService>(service: T) {
        return async (req: Request, res: Response) => {
            const { page, pageSize } = req.query;
            const serviceResult = await service.paginate(page as any, pageSize as any);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static handleValidationErrors(res: Response, validationErrors: Result<ValidationError>): void {
        const error = JSON.parse(validationErrors.array()[0].msg);
        res.status(error.statusCode).json({ error: true, message: error.message });
    }

    public static response(res: Response, responseData: ServiceResult) {
        res.status(responseData.statusCode).json(responseData.json);
    }

    public static rawResponse(res: Response, statusCode: number, error: boolean, message: string | null, data: any = {}) {
        res.status(statusCode).json({ error, message, data });
    }
}