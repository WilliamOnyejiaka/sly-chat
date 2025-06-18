import { Notification as NotificationRepo } from "../repos";
import { UserSocket } from "../cache";
import BaseService from "./bases/BaseService";
import { Server } from "socket.io";
import { Namespaces, UserType, NotificationStatus, NotificationEvents, ServiceResultDataType } from "../types/enums";
import { logger } from "../config";
import { getPagination } from "../utils";

export default class Notification extends BaseService<NotificationRepo> {

    public constructor() {
        super(new NotificationRepo())
    }

    private readonly userSocketCache = new UserSocket();

    public async notify(type: string, userType: UserType, userId: number, data: any, io: Server) {
        const cache = await this.userSocketCache.get(userType, userId);
        if (cache.error) return false;

        const socketData = cache.data;
        const socketId = socketData.notification;
        const isOnline = socketData && socketId;
        let userData = {};
        if (userType == UserType.Vendor) userData = { vendorId: userId };
        if (userType == UserType.Customer) userData = { customerId: userId };
        if (userType == UserType.Admin) throw new Error("🛑 Admin user type for this method is not allowed");

        const notificationData: any = {
            ...userData,
            channel: 'PUSH',
            type: type,
            status: isOnline ? NotificationStatus.SENT : NotificationStatus.PENDING,
            priority: 1,
            content: data
        };

        const repoResult = await this.repo?.insert(notificationData) as any;

        if (repoResult.error) {
            logger.error(`🛑 Failed create a notification - ${repoResult.message}`);
            return false;
        }

        if (isOnline) {
            const notificationNamespace = io.of(Namespaces.NOTIFICATION);
            notificationNamespace?.to(socketId)?.emit(NotificationEvents.NOTIFICATION, { data: repoResult.data });
            logger.info(`✅ notification for ${userType}:${userId} has been emitted`);
        }

        return true;
    }

    public async offlineNotifications(userId: number, userType: UserType, page: number, limit: number) {
        const idField = userType === UserType.Vendor ? "vendorId" : "customerId";
        const user = { [idField]: userId };
        const { skip, take } = super.skipAndTake(page, limit);

        const repoResult = await this.repo!.offlineNotifications(user, skip, take);
        const repoResultError = this.handleRepoError(ServiceResultDataType.SOCKET, repoResult);
        if (repoResultError) return repoResultError;

        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const items = data.items;
        const paginationData = getPagination(page, limit, totalRecords);
        return super.responseData(ServiceResultDataType.SOCKET, 200, false, null, { items, pagination: paginationData });
    }
}