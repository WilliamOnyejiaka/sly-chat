import { Request, Response } from "express";
import { ImageService, Store as StoreService } from "../services";
import constants, { http, HttpStatus, urls } from "../constants";
import { StoreDetailsDto } from "../types/dtos";
import { baseUrl } from "../utils";
import Controller from "./bases/Controller";
import { validationResult } from "express-validator";

export default class Store {

    private static readonly service: StoreService = new StoreService();
    public static readonly imageService: ImageService = new ImageService();

    public static async createAll(req: Request, res: Response) {
        const images = req.files!;
        const storeDetailsDto: StoreDetailsDto = req.body;
        storeDetailsDto.vendorId = Number(res.locals.data.id);
        const serviceResult = await Store.service.createStoreAll(storeDetailsDto, images as Express.Multer.File[]);
        Controller.response(res, serviceResult);
    }

    public static async createStore(req: Request, res: Response) {
        const storeDetailsDto: StoreDetailsDto = req.body;
        storeDetailsDto.vendorId = Number(res.locals.data.id);
        const serviceResult = await Store.service.createStore(storeDetailsDto);
        Controller.response(res, serviceResult);
    }

    public static async uploadStoreLogo(req: Request, res: Response) {
        const image = req.file!;
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            if (!(await Store.imageService.deleteFiles([image]))) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: true,
                message: http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!,
                data: {}
            });
            return;
        }

        const storeId = Number(req.params.storeId);
        const serviceResult = await Store.service.uploadStoreLogo(image, storeId);
        Controller.response(res, serviceResult);
    }

    private static uploadABanner(isFirstBanner: boolean = true) {
        return async (req: Request, res: Response) => {
            const validationErrors = validationResult(req);
            const image = req.file!;


            if (!validationErrors.isEmpty()) {
                if (!(await Store.imageService.deleteFiles([image]))) {
                    Controller.handleValidationErrors(res, validationErrors);
                    return;
                }
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: true,
                    message: http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!,
                    data: {}
                });
                return;
            }

            const storeId = Number(req.params.storeId);
            const serviceResult = isFirstBanner ? await Store.service.uploadFirstBanner(image, storeId) : await Store.service.uploadSecondBanner(image, storeId);
            Controller.response(res, serviceResult);
        }
    }

    public static uploadFirstBanner() {
        return Store.uploadABanner();
    }

    public static uploadSecondBanner() {
        return Store.uploadABanner(false);
    }

    public static async uploadBanners(req: Request, res: Response) {
        const validationErrors = validationResult(req);
        const images = req.files! as Express.Multer.File[];

        if (!validationErrors.isEmpty()) {
            if (!(await Store.imageService.deleteFiles(images))) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: true,
                message: http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!,
                data: {}
            });
            return;
        }

        const storeId = Number(req.params.storeId);
        const serviceResult = await Store.service.uploadBanners(images, storeId);
        Controller.response(res, serviceResult);
    }

    public static async getStoreAll(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);
        const baseServerUrl = baseUrl(req);
        const serviceResult = await Store.service.getStoreAll(vendorId, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async deleteStore(req: Request, res: Response) {
        const vendorId = Number(res.locals.data.id);

        const serviceResult = await Store.service.delete(vendorId);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }
}