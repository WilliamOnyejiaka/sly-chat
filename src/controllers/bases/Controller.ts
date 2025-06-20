import { Result, ValidationError, validationResult } from "express-validator";
import BaseService from "../../services/bases/BaseService";
import { Request, Response } from "express";
import { HttpData } from "../../types";

export default class Controller {

    public static paginate<T extends BaseService>(service: T) {
        return async (req: Request, res: Response) => {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const serviceResult = await service.paginate(page, limit);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        }
    }

    public static handleValidationErrors(res: Response, validationErrors: Result<ValidationError>): void {
        const error = JSON.parse(validationErrors.array()[0].msg);
        res.status(error.statusCode).json({ error: true, message: error.message });
    }

    public static handleValidationError(req: Request, res: Response): void {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            const error = JSON.parse(validationErrors.array()[0].msg);
            res.status(error.statusCode).json({ error: true, message: error.message });
            return;
        }
    }

    public static response(res: Response, responseData: HttpData) {
        res.status(responseData.statusCode).json(responseData.json);
    }

    public static rawResponse(res: Response, statusCode: number, error: boolean, message: string | null, data: any = {}) {
        res.status(statusCode).json({ error, message, data });
    }
}