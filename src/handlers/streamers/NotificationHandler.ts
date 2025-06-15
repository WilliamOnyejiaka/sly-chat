import { Server } from "socket.io";
import { Notification } from "../../services";
import { logger } from "../../config";
import { UserType } from "../../types/enums";

export default class NotificationHandler {

    private static readonly notificationService = new Notification();

    public static async notify(event: any, stream: string, id: string, io?: Server) {
        const userDetails = event.data.userDetails;
        delete event.data.userDetails;
        const result = await NotificationHandler.notificationService.notify(userDetails.userType as UserType, userDetails.userId, event.data, io!);
    }
}