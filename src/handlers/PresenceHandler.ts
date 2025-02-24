import { OnlineCustomer, OnlineVendor } from "../cache";
import { ISocket } from "../types";
import { UserType } from "../types/enums";


export default class PresenceHandler {

    private static readonly onlineCustomer: OnlineCustomer = new OnlineCustomer();
    private static readonly onlineVendor: OnlineVendor = new OnlineVendor();

    public static userIsOnline(socket: ISocket) {
        return async (data: any) => {
            const userId = String(socket.locals.data.id);
            const userType = socket.locals.userType;

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

        }
    }

    public static disconnect(socket: ISocket) {
        return async (data: any) => {
            const userId = String(socket.locals.data.id);
            const userType = socket.locals.userType;

            if (userType == UserType.Customer) {
                const unsuccessful = await PresenceHandler.onlineCustomer.delete(userId);
                if (!unsuccessful) {
                    socket.emit('appError', {
                        error: true,
                        message: "Something went wrong",
                        statusCode: 500
                    });
                    return;
                }
            } else if (userType == UserType.Vendor) {
                const unsuccessful = await PresenceHandler.onlineVendor.delete(userId);
                if (!unsuccessful) {
                    socket.emit('appError', {
                        error: true,
                        message: "Something went wrong",
                        statusCode: 500
                    });
                    return;
                }
            }

        }
    }
}