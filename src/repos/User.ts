import Repo from "./bases/Repo";
import prisma from ".";
import { UserDto } from "../types/dtos";
import { UserType } from "../types/enums";

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
}