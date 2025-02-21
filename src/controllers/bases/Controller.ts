import { Result, ValidationError } from "express-validator";
import BaseService from "../../services/bases/BaseService";
import { Request, Response } from "express";
import { ImageService } from "../../services";

export default class Controller {

    private static readonly imageService = new ImageService();

    public static async deleteFiles(files: Express.Multer.File[]) {
        return await Controller.imageService.deleteFiles(files);
    }

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

    public static response(res: Response, responseData: {
        statusCode: number, json: {
            error: boolean;
            message: string | null;
            data: any;
        }
    }) {
        res.status(responseData.statusCode).json(responseData.json);
    }
}