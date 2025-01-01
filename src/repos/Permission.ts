import prisma from ".";
import { PermissionDto } from "../types/dtos";
import Repo from "./bases/Repo"


export default class Permission extends Repo {

    public constructor() {
        super('permission');
    }
}