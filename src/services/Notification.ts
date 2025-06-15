import { Notification as NotificationRepo } from "../repos";
import { UserSocket } from "../cache";
import BaseService from "./bases/BaseService";
import { Server } from "socket.io";
import { Namespaces, UserType, NotificationStatus, NotificationEvents } from "../types/enums";
import { logger } from "../config";

export default class Notification extends BaseService<NotificationRepo> {

    public constructor() {
        super(new NotificationRepo())
    }

    private readonly userSocketCache = new UserSocket();

    public async notify(userType: UserType, userId: number, data: any, io: Server) {
        const cache = await this.userSocketCache.get(userType, userId);
        if (cache.error) return false;

        const socketData = cache.data;
        const socketId = socketData.notification;
        const isOnline = socketData && socketId;
        let userData = {};
        if (userType == UserType.Vendor) userData = { vendorId: userId };
        if (userType == UserType.Customer) userData = { customerId: userId };
        if (userType == UserType.Admin) throw new Error("Admin user type for this method is not allowed");

        const notificationData: any = {
            ...userData,
            channel: 'PUSH',
            // type: '', like,comment,post
            status: isOnline ? NotificationStatus.SENT : NotificationStatus.PENDING,
            priority: 1,
            content: JSON.stringify(data)
        };

        const repoResult = await this.repo?.insert(notificationData) as any;

        if (repoResult.error) {
            logger.error(`🛑 Failed create a notification - ${repoResult.message}`);
            return false;
        }

        if (isOnline) {
            const notificationNamespace = io.of(Namespaces.NOTIFICATION);
            notificationNamespace?.to(socketId)?.emit(NotificationEvents.NOTIFICATION, { data: repoResult.data });
            logger.info(`notification for ${userType}:${userId} has been emitted`);
        }

        return true;
    }
}