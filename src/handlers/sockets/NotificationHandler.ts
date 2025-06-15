import { Server } from "socket.io";
import { ISocket } from "../../types";
import { UserSocket } from "../../cache";
import Handler from "./Handler";
import { UserType } from "../../types/enums";

export default class NotificationHandler {

    private static readonly userSocketCache = new UserSocket();

    public static async onConnection(io: Server, socket: ISocket) {
        console.log("User connected: ", socket.id);

        const socketId = socket.id;

        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType as UserType;

        console.log(`User id ${userId} , user type ${userType}`);

        const cache = await NotificationHandler.userSocketCache.get(userType, userId);
        if (cache.error) {
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
        }
        const socketData = cache.data;
        console.log("data - ", socketData);


        if (socketData) {
            socketData.notification = socketId;
            if (await NotificationHandler.userSocketCache.set(userType, userId, { ...socketData })) {
                console.log("successfully cached");
            }
        } else if (await NotificationHandler.userSocketCache.set(userType, userId, { notification: socketId, chat: null })) {
            console.log("New user cache was successfully created");
        }
        // TODO: add an else
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