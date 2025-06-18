import { Server } from "socket.io";
import { ISocket } from "../../types";
import { UserSocket } from "../../cache";
import Handler from "./Handler";
import { Events, UserType } from "../../types/enums";
import { logger } from "../../config";
import { Notification } from "../../services";

export default class NotificationHandler {

    private static readonly userSocketCache = new UserSocket();
    private static readonly service = new Notification();

    public static async onConnection(io: Server, socket: ISocket) {
        const socketId = socket.id;

        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType as UserType;

        //TODO: Convert cache logic to a function/method
        const cache = await NotificationHandler.userSocketCache.get(userType, userId);
        if (cache.error) {
            socket.emit(Events.APP_ERROR, Handler.responseData(500, true, "An internal error occurred"));
            return;
        }
        const socketData = cache.data;
        const successMessage = `${userType}:${userId} with the socket id - ${socketId} has connected`;
        if (socketData) {
            socketData.notification = socketId;
            if (await NotificationHandler.userSocketCache.set(userType, userId, { ...socketData })) {
                logger.info(successMessage);
            } else {
                logger.error(`Failed to cache ${userType}:${userId}`);
                socket.emit(Events.APP_ERROR, Handler.responseData(500, true, "An internal error occurred"));
                return;
            }
        } else if (await NotificationHandler.userSocketCache.set(userType, userId, { notification: socketId, chat: null })) {
            logger.info(successMessage);
        } else {
            logger.error(`Failed to cache ${userType}:${userId}`);
            socket.emit(Events.APP_ERROR, Handler.responseData(500, true, "An internal error occurred"));
            return;
        }

        const result = await NotificationHandler.service.offlineNotifications(userId, userType, 1, 10) as {
            statusCode: number;
            error: boolean;
            message: string | null;
            data: any;
        };
        socket.emit('offlineNotifications', Handler.responseData(result.statusCode, result.error, result.message, result.data));
    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;

            const cache = await NotificationHandler.userSocketCache.get(userType, userId);
            if (cache.error) {
                socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
            }
            const socketData = cache.data;
            if (socketData) {
                socketData.notification = null;
                if (await NotificationHandler.userSocketCache.set(userType, userId, { ...socketData })) {
                    console.log("User was disconnected successfully");
                }
            }

            console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
        }
    }
}