import { Notification as NotificationRepo } from "../repos";
import { UserSocket } from "../cache";
import BaseService from "./bases/BaseService";
import { Server } from "socket.io";
import { Namespaces, UserType, NotificationStatus, NotificationEvents, ServiceResultDataType } from "../types/enums";
import { logger } from "../config";
import { getPagination } from "../utils";
import { HttpData, SocketData } from "../types";

export default class Notification extends BaseService<NotificationRepo> {

    private readonly socketCache = new UserSocket();

    public constructor() {
        super(new NotificationRepo())
    }

    public async notify(type: string, userType: UserType, userId: number, data: any, io: Server) {
        const cache = await this.socketCache.get(userType, userId);
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

        logger.info(`👍 notification for ${userType}:${userId} has been saved successfully`);
        if (isOnline) {
            const notificationNamespace = io.of(Namespaces.NOTIFICATION);
            notificationNamespace?.to(socketId)?.emit(NotificationEvents.NOTIFICATION, { data: repoResult.data });
            logger.info(`✅ notification for ${userType}:${userId} has been emitted`);
        }

        return true;
    }

    public async cacheUserNotificationSocketId(userId: number, userType: UserType, socketId: string): Promise<SocketData> {
        const cache = await this.socketCache.get(userType, userId);
        if (cache.error) return this.responseData(ServiceResultDataType.SOCKET, 500, true, "An internal error occurred") as SocketData;

        const socketData = cache.data;
        if (socketData) {
            socketData.notification = socketId;
            if (await this.socketCache.set(userType, userId, { ...socketData })) {
                return this.responseData(ServiceResultDataType.SOCKET, 200, false, null) as SocketData;
            } else {
                logger.error(`Failed to cache ${userType}:${userId}`);
                return this.responseData(ServiceResultDataType.SOCKET, 500, true, "An internal error occurred") as SocketData;
            }
        } else if (await this.socketCache.set(userType, userId, { notification: socketId, chat: null })) {
            return this.responseData(ServiceResultDataType.SOCKET, 200, false, null) as SocketData;
        } else {
            logger.error(`Failed to cache ${userType}:${userId}`);
            return this.responseData(ServiceResultDataType.SOCKET, 500, true, "An internal error occurred") as SocketData;
        }
    }

    public async deleteUserNotificationSocketId(userId: number, userType: UserType) {
        const cache = await this.socketCache.get(userType, userId);
        if (cache.error) return this.responseData(ServiceResultDataType.SOCKET, 500, true, "An internal error occurred") as SocketData;

        const socketData = cache.data;
        if (socketData) {
            socketData.notification = null;
            if (await this.socketCache.set(userType, userId, { ...socketData })) {
                return this.responseData(ServiceResultDataType.SOCKET, 200, false, null) as SocketData;
            }
            return this.responseData(ServiceResultDataType.SOCKET, 500, true, "An internal error occurred") as SocketData;
        }
        return this.responseData(ServiceResultDataType.SOCKET, 200, false, null) as SocketData;
    }

    public async offlineNotifications(dataType: ServiceResultDataType, userId: number, userType: UserType, page: number, limit: number) {
        const idField = userType === UserType.Vendor ? "vendorId" : "customerId";
        const user = { [idField]: userId };
        const { skip, take } = super.skipAndTake(page, limit);

        const repoResult = await this.repo!.offlineNotifications(user, skip, take);
        const repoResultError = this.handleRepoError(dataType, repoResult);
        if (repoResultError) return repoResultError;

        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const items = data.items;
        const paginationData = getPagination(page, limit, totalRecords);
        return super.responseData(dataType, 200, false, null, { items, pagination: paginationData });
    }

    public async userNotifications(dataType: ServiceResultDataType, userId: number, userType: UserType, page: number, limit: number) {
        const idField = userType === UserType.Vendor ? "vendorId" : "customerId";
        const user = { [idField]: userId };
        const { skip, take } = super.skipAndTake(page, limit);
        console.log(user);


        const repoResult = await this.repo!.userNotifications(user, skip, take);
        const repoResultError = this.handleRepoError(dataType, repoResult) as HttpData;

        console.log(repoResult);

        if (repoResultError) return repoResultError;

        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const items = data.items;
        const paginationData = getPagination(page, limit, totalRecords);
        return super.responseData(dataType, 200, false, null, { items, pagination: paginationData }) as HttpData;
    }
}