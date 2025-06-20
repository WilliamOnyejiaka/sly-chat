import { Server } from "socket.io";
import { ISocket } from "../../types";
import { UserSocket } from "../../cache";
import Handler from "./Handler";
import { Events, ServiceResultDataType, SocketData, UserType } from "../../types/enums";
import { logger } from "../../config";
import { Notification } from "../../services";

export default class NotificationHandler {

    private static readonly service = new Notification();

    public static async onConnection(io: Server, socket: ISocket) {
        const socketId = socket.id;
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType as UserType;

        const cacheResult = await NotificationHandler.service.cacheUserNotificationSocketId(userId, userType, socketId);
        if (cacheResult.error) {
            socket.emit(Events.APP_ERROR, cacheResult);
            return;
        }

        logger.info(`${userType}:${userId} with the socket id - ${socketId} has connected to notification namespace`);

        const result = await NotificationHandler.service.offlineNotifications(ServiceResultDataType.SOCKET,userId, userType, 1, 10) as SocketData;
        socket.emit('offlineNotifications', Handler.responseData(result.statusCode, result.error, result.message, result.data));
    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;

            const cacheResult = await NotificationHandler.service.deleteUserNotificationSocketId(userId, userType);
            if (cacheResult.error) {
                socket.emit(Events.APP_ERROR, cacheResult);
                return;
            }

            logger.info(`${userType}:${userId} with the socket id - ${socket.id} has disconnected from notification namespace`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
        }
    }
}