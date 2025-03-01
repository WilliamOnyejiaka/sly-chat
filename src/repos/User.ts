import Repo from "./bases/Repo";
import prisma from ".";
import { UserDto } from "../types/dtos";

export default class User extends Repo {

    public constructor() {
        super('user')
    }

    public async insert<T = UserDto>(newUser: T) {
        return await super.insert<T>(newUser);
    }
}