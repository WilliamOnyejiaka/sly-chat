import prisma from ".";
import Repo from "./bases/Repo"
import { http } from "../constants";
import { RoleDto } from "../types/dtos";
export default class Role extends Repo {

    public constructor() {
        super('role');
    }
}