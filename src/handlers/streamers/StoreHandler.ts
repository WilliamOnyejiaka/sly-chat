import { Server } from "socket.io";
import { Store } from "../../services";
import { logger } from "../../config";

export default class StoreHandler {

    private static readonly service = new Store();

    public static async create(event: any, stream: string, id: string, io?: Server): Promise<void> {
        const data = event.data;

        const result = await StoreHandler.service.createStore({
            vendorId: data.vendorId,
            name: data.name,
            storeId: data.id,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            storeLogoUrl: data.storeLogoUrl
        });

        logger.info(`✅ Vendor with the id - ${data.vendorId} has created a store with the id - ${data.id}`);
    }

    public static async upload(event: any, stream: string, id: string, io?: Server): Promise<void> {
        const data = event.data;
        const result = await StoreHandler.service.upload(data.storeId, data.imageUrl);
        logger.info(`✅ Store with the id - ${data.storeId} has updated its store logo`);
    }

    public static async delete(event: any, stream: string, id: string, io?: Server): Promise<void> {
        const data = event.data;
        const result = await StoreHandler.service.delete(data.vendorId);
        logger.info(`✅ Vendor with the id - ${data.vendorId} has delete a store`);
    }
}