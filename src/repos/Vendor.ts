import prisma from ".";
import { http } from "../constants";
import VendorDto from "../types/dtos";
import Repo from "./bases/Repo";
import UserRepo from "./bases/UserRepo";

interface UpdateData {
    firstName?: string,
    lastName?: string,
    password?: string,
    email?: string,
    verified?: boolean
}

export default class Vendor extends UserRepo {

    public constructor() {
        super("vendor", "profilePicture");
    }

    public async updateVendor(id: number, data: any) {
        return await super.update({ id: id }, data);
    }

    public async updateFirstName(id: number, firstName: string) {
        return await this.updateVendor(id, { firstName: firstName });
    }

    public async updateLastName(id: number, lastName: string) {
        return await this.updateVendor(id, { lastName: lastName });
    }

    public async updateEmail(id: number, email: string) {
        return await this.updateVendor(id, { email: email, verified: false });
    }
}