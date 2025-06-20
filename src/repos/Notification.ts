import Repo from "./bases/Repo";


export default class Notification extends Repo {

    public constructor() {
        super('notification');
    }

    public async offlineNotifications(user: any, skip: number, take: number) {
        try {
            const where = {
                status: "PENDING",
                ...user
            };
            let items = await this.prisma.notification.findMany({
                where,
                skip,
                take,
            });

            // Get IDs of fetched notifications
            const notificationIds = items.map(item => item.id);
            // Update status to SENT for fetched notifications
            if (notificationIds.length > 0) {
                await this.prisma.notification.updateMany({
                    where: {
                        id: { in: notificationIds }
                    },
                    data: {
                        status: "SENT"
                    }
                });
            }

            items = items.map(item => ({ ...item, status: "SENT" }));

            const totalItems = await this.prisma.notification.count({ where: where })
            const data = { items, totalItems };
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async userNotifications(user: any, skip: number, take: number) {
        try {
            const where = {
                ...user
            };
            
            const items = await this.prisma.notification.findMany({
                where,
                skip,
                take,
            });

            const totalItems = await this.prisma.notification.count({ where: where })
            const data = { items, totalItems };
            return this.repoResponse(false, 200, null, data);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }
}