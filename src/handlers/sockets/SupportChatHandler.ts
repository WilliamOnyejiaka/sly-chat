import { Server } from "socket.io";
import { ISocket } from "../../types";
import { Events, Namespace, UserType } from "../../types/enums";
import Handler from "./Handler";
import { PresenceFacade } from "../../facade";
import { OnlineCustomer, OnlineSupport, OnlineVendor } from "../../cache";


export default class SupportChatHandler {
    private static readonly facade: PresenceFacade = new PresenceFacade();
    private static readonly onlineSupport = new OnlineSupport();
    private static readonly onlineCustomer = new OnlineCustomer();
    private static readonly onlineVendor = new OnlineVendor();

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
            const facadeResult = await SupportChatHandler.facade.deleteOnlineUser(String(userId), userType);

            if (facadeResult.error) {
                socket.emit('appError', {
                    error: true,
                    message: facadeResult.message,
                    statusCode: 500
                });
                return;
            }

            const chatRoomsResult = await SupportChatHandler.facade.getUserTransactionChatRooms(userId, userType);
            if (chatRoomsResult.error) {
                socket.emit('appError', chatRoomsResult);
                return;
            }

            const chatRooms = chatRoomsResult.data;
            const rooms = chatRooms ? (chatRooms as Array<any>).map(item => `chat_${item.productId}_${item.vendorId}_${item.customerId}`) : [];

            console.log('User chat rooms', rooms);

            if (rooms.length > 0) io.of(Namespace.CHAT).to(rooms).emit('userIsOffline', Handler.responseData(200, false, "User has gone offline"));
            console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
        }
    }
}