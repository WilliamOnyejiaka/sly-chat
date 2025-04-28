import { Server } from "socket.io";
import { Vendor, Customer } from "../../services";
import { UserDto } from "../../types/dtos";
import { UserType } from "../../types/enums";
import { logger } from "../../config";

export default class UserHandler {

    private static readonly customerService = new Customer();
    private static readonly vendorService = new Vendor();

    public static async createCustomer(event: any, stream: string, id: string, io?: Server): Promise<void> {
        const data = event.data;

        const userDto: UserDto = {
            userId: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            verified: data.verified,
            active: data.active,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            email: data.email,
            profilePictureUrl: data.imageUrl
        }
        const result = await UserHandler.customerService.createUser(userDto);
        logger.info(`✅ Customer with the id - ${data.id} has been created.`);
    }


    public static async createVendor(event: any, stream: string, id: string, io?: Server): Promise<void> {
        const data = event.data;

        const userDto: UserDto = {
            userId: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            verified: data.verified,
            active: data.active,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            email: data.email,
            profilePictureUrl: data.imageUrl
        }
        const result = await UserHandler.vendorService.createUser(userDto);
        logger.info(`✅ Vendor with the id - ${data.id} has been created.`);
    }

    // public static createAdmin() {
    //     return UserHandler.createUser(UserType.Admin);
    // }

    // public static async upload(event: any, stream: string, id: string, io?: Server): Promise<void> {
    //     const data = event.data;
    //     const result = await UserHandler.service.uploadProfilePic(data.userId, data.userType.toUpperCase(), data.imageUrl);
    //     logger.info(`✅ ${data.userType} with the id - ${data.userId} has uploaded a profile picture.`);
    // }
} 