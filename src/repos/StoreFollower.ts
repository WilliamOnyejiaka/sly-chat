import Repo from "./bases/Repo";

export default class StoreFollower extends Repo {

    public constructor() {
        super('storeFollower');
    }

    public async follow(customerId: number, storeId: number) {
        try {
            const created = await this.prisma.storeFollower.create({
                data: {
                    customerId,
                    storeId
                },
            });
            return this.repoResponse(false, 201, null, created);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    public async unfollow(customerId: number, storeId: number) {
        try {
            const deleted = await this.prisma.storeFollower.delete({
                where: { storeId_customerId: { storeId, customerId } },
            });
            return this.repoResponse(false, 200, null, deleted);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

}