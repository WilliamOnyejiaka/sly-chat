import { Store as StoreService } from "../services";
import { Request, Response } from "express";
import { numberValidator } from "../validators";
import { baseUrl } from "../utils";

export default class AdminStore {

    private static readonly service: StoreService = new StoreService();

    public static async retrieveVendorStore(req: Request, res: Response) {
        const idResult = numberValidator(req.params.vendorId);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "id must be an integer"
            });
            return;
        }

        const baseServerUrl = baseUrl(req);
        const serviceResult = await AdminStore.service.getStoreAll(idResult.number, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async paginateStores(req: Request, res: Response) {
        const pageResult = numberValidator(req.query.page);
        if (pageResult.error) {
            res.status(400).json({
                error: true,
                message: "page must be an integer"
            });
            return;
        }

        const pageSizeResult = numberValidator(req.query.pageSize);
        if (pageSizeResult.error) {
            res.status(400).json({
                error: true,
                message: "pageSize must be an integer"
            });
            return;
        }

        const page = pageResult.number;
        const pageSize = pageSizeResult.number;
        const baseServerUrl = baseUrl(req);

        const serviceResult = await AdminStore.service.paginateStores(page, pageSize, baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllStores(req: Request, res: Response) {
        const baseServerUrl = baseUrl(req);
        const serviceResult = await AdminStore.service.getAllStores(baseServerUrl);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async deleteStore(req: Request, res: Response) {
        const idResult = numberValidator(req.params.vendorId);
        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "id must be an integer"
            });
            return;
        }

        const serviceResult = await AdminStore.service.delete(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}