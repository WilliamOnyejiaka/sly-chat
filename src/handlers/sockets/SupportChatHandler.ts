import { Server } from "socket.io";
import { ISocket } from "../../types";
import { Events, Namespaces, UserType } from "../../types/enums";
import Handler from "./Handler";

export default class SupportChatHandler {

    public static async onConnection(io: Server, socket: ISocket) {
        const supportChatSocketId = socket.id;
        console.log("User connected: ", supportChatSocketId);
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        console.log(`User id ${userId} , user type ${userType}`);

        // let cache;

        // if (userType === UserType.Customer) {
        //     cache = SupportChatHandler.onlineCustomer;
        // } else if (userType === UserType.Vendor) {
        //     cache = SupportChatHandler.onlineVendor;
        // } else {
        //     cache = SupportChatHandler.onlineSupport;
        // }

        // const onlineCache = await cache.get(String(userId));
        // if (onlineCache.error) {
        //     socket.emit(EventList.APP_ERROR, {
        //         error: true,
        //         message: "Something went wrong",
        //         statusCode: 500
        //     });
        //     return;
        // }

        // const onlineData = onlineCache.data;
        // if (!onlineData) {
        //     socket.emit(EventList.APP_ERROR, {
        //         error: true,
        //         message: "Connect to presence namespace first",
        //         statusCode: 400
        //     });
        // }

        // const socketId = JSON.parse(onlineData).socketId;
        // const successful = await cache.set(userId, {
        //     chatSocketId: socket.id,
        //     socketId,
        //     supportChatSocketId
        // });

        // if (!successful) this.service.socketResponseData(500, true, "Something went wrong")

        // return this.service.socketResponseData(200, false);

        // const facadeResult = await SupportChatHandler.facade.setOnlineUser(userId, socketId, userType);
        // if (facadeResult.error) {
        //     socket.emit('appError', {
        //         error: true,
        //         message: facadeResult.message,
        //         statusCode: 500
        //     });
        //     socket.disconnect(true);
        //     return;
        // }
        // io.of(Namespace.PRESENCE).emit("userIsOnline", Handler.responseData(200, false, "User is online"));
    }

    public static async sendMessage(io: Server, socket: ISocket, data: any) {

    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;
            console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
        }
    }
}