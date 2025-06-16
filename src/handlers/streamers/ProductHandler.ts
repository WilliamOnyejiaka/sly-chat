import { Server } from "socket.io";
import { Notification } from "../../services";
import { logger } from "../../config";
import { UserType } from "../../types/enums";

export default class ProductHandler {

    private static readonly notificationService = new Notification();

    public static async create(event: any, stream: string, id: string, io?: Server) {
        const data = event.data.data;
        const result = await ProductHandler.notificationService.notify("HEllo",data.userType as UserType, data.clientId, event.data, io!);
    }
}