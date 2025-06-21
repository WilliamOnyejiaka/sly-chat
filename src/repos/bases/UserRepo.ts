import { PrismaClient } from "@prisma/client";
import Repo from "./Repo";

export default class UserRepo extends Repo {


    public constructor(tblName: keyof PrismaClient,) {
        super(tblName);
    }

    public async getUserWithId(userId: number) {
        return await super.getItemWithId(userId);
    }

    public async getUserWithPhoneNumber(phoneNumber: string) {
        return await super.getItem({ 'phoneNumber': phoneNumber });
    }

    public async updateProfilePic(userId: number, profilePictureUrl: string) {
        return await super.update({ userId }, { profilePictureUrl })
    }

    public async getUserProfile(userIdOrEmail: number | string) {
        const where = typeof userIdOrEmail == "number" ? { id: userIdOrEmail } : { email: userIdOrEmail };
        const store = this.tblName == "vendor" ? {
            store: {
                select: {
                    id: true,
                    name: true,
                    storeLogoUrl: true,
                    vendorId: true
                }
            },
        } : {};
        return await super.getItem(where, {
            include: {
                ...store
            }
        });
    }

    public async getUserProfileWithId(userId: number) {
        return await this.getUserProfile(userId);
    }

    public async getUserProfileWithEmail(userEmail: string) {
        return await this.getUserProfile(userEmail);
    }

    protected async updateWithIdOrEmail(idOrEmail: number | string, data: any) {
        const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };
        return await this.update(where, data);
    }

    public async updateLastSeen(userId: number) {
        return await this.update({ userId }, { lastSeen: new Date() });
    }

    public async updateActiveStatus(userId: number, activate: boolean = true) {
        return await this.updateWithIdOrEmail(userId, { active: activate });
    }

    public async updatePassword(email: string, password: string) {
        return await this.updateWithIdOrEmail(email, { password: password });
    }

    public async updateVerifiedStatus(email: string) {
        return await super.update({ email: email }, { verified: true });
    }

    public async findLastSeen(userId: number) {
        try {
            const data = await (this.prisma[this.tblName] as any).findFirst({
                where: { userId },
                select: { lastSeen: true }
            });

            return super.repoResponse(false, 200, null, data);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }
}