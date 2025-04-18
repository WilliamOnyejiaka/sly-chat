import Repo from "./bases/Repo";
import prisma from ".";
import { UserDto } from "../types/dtos";
import { UserType } from "@prisma/client";

export default class User extends Repo {

    public constructor() {
        super('user')
    }

    public async insert<T = UserDto>(newUser: T) {
        return await super.insert<T>(newUser);
    }

    public async userEmailExists(email: string, userType: string) {
        return await super.getItem({ email, userType });
    }

    public async updateProfilePic(userId: number, userType: string, profilePictureUrl: string) {
        return await super.update({ userId_userType: { userId, userType } }, { profilePictureUrl })
    }

    // public async updateProfilePic(userId: number, userType: string, profilePictureUrl: string) {
    //     try {
    //         const updatedItem = await prisma.user.update({
    //             where: {
    //                 userId: userId,
    //                 userType: userType
    //             } as any,
    //             data: {
    //                 profilePictureUrl: profilePictureUrl
    //             }
    //         });

    //         return this.repoResponse(false, 200, null, updatedItem);
    //     } catch (error: any) {
    //         return this.handleDatabaseError(error);
    //     }
    // }
}