import { Prisma } from "@prisma/client";
import prisma from ".";
import UserRepo from "./bases/UserRepo";

export default class Customer extends UserRepo {

    public constructor() {
        super('customer', 'CustomerProfilePic');
    }

    public override async insert(data: any) {
        const insertData = {
            ...data.customerData,
            Address: {
                create: data.addressData
            }
        };
        return await super.insert(insertData);
    }
}