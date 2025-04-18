import { Server } from "socket.io";
import { User } from "../../services";
import { UserDto } from "../../types/dtos";
import { UserType } from "../../types/enums";
import { logger } from "../../config";

export default class UserHandler {

    private static readonly service = new User();

    public static createUser(userType: UserType) {

        return async (event: any, stream: string, id: string, io?: Server): Promise<void> => {
            const data = event.data;

            const userDto: UserDto = {
                userId: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                verified: data.verified,
                active: data.active,
                userType: userType.toUpperCase(),
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                email: data.email,
                profilePictureUrl: data.imageUrl
            }
            const result = await UserHandler.service.createUser(userDto);
            logger.info(`✅ ${userType} with the id - ${data.id} has been created.`);
        };
    }

    public static createCustomer() {
        return UserHandler.createUser(UserType.Customer);
    }

    public static createVendor() {
        return UserHandler.createUser(UserType.Vendor);
    }

    public static createAdmin() {
        return UserHandler.createUser(UserType.Admin);
    }

    public static async upload(event: any, stream: string, id: string, io?: Server): Promise<void> {
        const data = event.data;
        const result = await UserHandler.service.uploadProfilePic(data.userId, data.userType.toUpperCase(), data.imageUrl);
        logger.info(`✅ ${data.userType} with the id - ${data.userId} has uploaded a profile picture.`);
    }
} 