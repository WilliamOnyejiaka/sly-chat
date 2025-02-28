import { Server } from "socket.io";
import { OnlineCustomer, OnlineVendor, OnlineAdmin } from "../cache";
import { Chat as ChatRepo } from "./../repos";
import { ISocket } from "../types";
import { Namespace, UserType } from "../types/enums";
import Handler from "./Handler";
import { PresenceFacade } from "../facade";


export default class PresenceHandler {
    private static readonly facade: PresenceFacade = new PresenceFacade();

    public static async onConnection(io: Server, socket: ISocket) {
        const socketId = socket.id;
        console.log("User connected: ", socketId);
        const userId = Number(socket.locals.data.id);
        const userType = socket.locals.userType;
        console.log(`User id ${userId} , user type ${userType}`);

        const facadeResult = await PresenceHandler.facade.setOnlineUser(userId, socketId, userType);
        if (facadeResult.error) {
            socket.emit('appError', {
                error: true,
                message: facadeResult.message,
                statusCode: 500
            });
            socket.disconnect(true);
            return;
        }
        io.of(Namespace.PRESENCE).emit("userIsOnline", Handler.responseData(200, false, "User is online"));
    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;
            const facadeResult = await PresenceHandler.facade.deleteOnlineUser(String(userId), userType);

            if (facadeResult.error) {
                socket.emit('appError', {
                    error: true,
                    message: facadeResult.message,
                    statusCode: 500
                });
                return;
            }

            const chatRoomsResult = await PresenceHandler.facade.getUserTransactionChatRooms(userId, userType);
            if (chatRoomsResult.error) {
                socket.emit('appError', chatRoomsResult);
                return;
            }

            const chatRooms = chatRoomsResult.data;
            const rooms = chatRooms ? (chatRooms as Array<{ id: string }>).map(item => item.id) : [];

            console.log('User chat rooms', rooms);

            if (rooms.length > 0) io.of(Namespace.CHAT).to(rooms).emit('userIsOffline', Handler.responseData(200, false, "User has gone offline"));
            console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
        }
    }
}