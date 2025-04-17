import { PrismaClient } from "@prisma/client";
import Repo from "./Repo";

export default class Like extends Repo {

    public constructor(protected likeTbl: keyof PrismaClient, protected parentColumn: string) {
        super(likeTbl);
    }

    public async toggleLike(userId: number, userType: string, parentId: number | string) {
        try {
            const data = await this.prisma.$transaction(async (tx): Promise<{
                action: 'liked' | 'unlike';
                totalLikes: number;
            }> => {
                // Check if the like exists
                const existingLike = await (tx[this.tblName as any] as any).findUnique({
                    where: {
                        [`userId_${this.parentColumn}_userType`]: { userId, [this.parentColumn]: parentId, userType },
                    } as any,
                });

                let action: 'liked' | 'unlike';

                if (existingLike) {
                    // Unlike: Delete the existing like
                    await (tx[this.tblName as any] as any).delete({
                        where: {
                            [`userId_${this.parentColumn}_userType`]: { userId, [this.parentColumn]: parentId, userType },
                        } as any,
                    });
                    action = 'unlike';
                } else {
                    // Like: Create a new like
                    await (tx[this.tblName as any] as any).create({
                        data: {
                            userId,
                            [this.parentColumn]: parentId,
                            userType
                        } as any,
                    });
                    action = 'liked';
                }

                // Get the updated total like count
                const totalLikes = await (tx[this.tblName as any] as any).count({
                    where: { [this.parentColumn]: parentId },
                });

                return { action, totalLikes };
            });
            return this.repoResponse(false, 200, null, data);
        } catch (error: any) {
            return this.handleDatabaseError(error);
        }
    }

    public async countLikes(parentId: number | string) {
        return await ((this.prisma[this.likeTbl] as any) as any).count({ where: { [`${this.parentColumn}`]: parentId } })
    }
}