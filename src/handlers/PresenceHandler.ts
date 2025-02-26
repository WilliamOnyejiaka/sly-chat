import { Server } from "socket.io";
import { OnlineCustomer, OnlineVendor } from "../cache";
import { Chat as ChatRepo } from "./../repos";
import { ISocket } from "../types";
import { Namespace, UserType } from "../types/enums";
import Handler from "./Handler";


export default class PresenceHandler {

    private static readonly onlineCustomer: OnlineCustomer = new OnlineCustomer();
    private static readonly onlineVendor: OnlineVendor = new OnlineVendor();
    private static chatRepo = new ChatRepo();

    public static async onConnection(io: Server, socket: ISocket) {
        console.log("User connected: ", socket.id);
        const userId = String(socket.locals.data.id);
        const userType = socket.locals.userType;
        console.log(`User id ${userId} , user type ${userType}`);

        if (userType == UserType.Customer) {
            const successful = await PresenceHandler.onlineCustomer.set(userId, {
                socketId: socket.id
            });
            if (!successful) {
                socket.emit('appError', {
                    error: true,
                    message: "Something went wrong",
                    statusCode: 500
                });
                return;
            }
        } else if (userType == UserType.Vendor) {
            const successful = await PresenceHandler.onlineVendor.set(userId, {
                socketId: socket.id
            });
            if (!successful) {
                socket.emit('appError', {
                    error: true,
                    message: "Something went wrong",
                    statusCode: 500
                });
                return;
            }
        } else {
            socket.emit('appError', {
                error: true,
                message: "Invalid user type",
                statusCode: 401
            });
            return;
        }

        io.of(Namespace.PRESENCE).emit("userIsOnline", Handler.responseData(200, false, "User is online"));
    }

    public static async disconnect(io: Server, socket: ISocket, data: any) {
        try {
            const userId = String(socket.locals.data.id);
            const userType = socket.locals.userType;

            const unsuccessful = await (userType == UserType.Customer ? PresenceHandler.onlineCustomer : PresenceHandler.onlineVendor).delete(userId);
            if (!unsuccessful) {
                socket.emit('appError', {
                    error: true,
                    message: "Something went wrong",
                    statusCode: 500
                });
                return;
            }
            const repoResult = userType == UserType.Customer ? await PresenceHandler.chatRepo.getCustomerChatsWithMessages(userId) : await PresenceHandler.chatRepo.getVendorChatsWithMessages(userId);
            const repoResultError = Handler.handleRepoError(repoResult);
            if (repoResultError) {
                socket.emit('appError', repoResultError);
                return;
            }
            const chat = repoResult.data;
            const rooms = chat.map((item: any) => item.publicId);

            if (rooms.length > 0) {
                socket.to(rooms).emit('userIsOffline', {
                    error: false,
                    message: "User has gone offline"
                });
            }
            console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
        } catch (error) {
            console.error("❌ Error in disconnect:", error);
            socket.emit("appError", {
                error: true,
                message: "An internal error occurred",
                statusCode: 500,
            });
        }
    }
}