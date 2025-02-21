import { Prisma } from "@prisma/client";
import prisma from ".";
import UserRepo from "./bases/UserRepo";

export default class Customer extends UserRepo {

    public constructor() {
        super('customer', 'CustomerProfilePic');
    }

    public override async insert(data: any) {
        return await super.insert(data);
    }
}