import { Admin } from ".";
import constants, { http } from "../constants";
import { Permission as PermissionRepo } from "../repos";
import { PermissionDto } from "../types/dtos";
import BaseService from "./bases/BaseService";


export default class Permission extends BaseService<PermissionRepo> {

    public constructor() {
        super(new PermissionRepo());
    }

    public async getAllPermissions() {
        return await super.getAllItems(constants('200Permissions')!);
    }

    public async createPermission(permissionData: PermissionDto) {
        return await super.create<PermissionDto>(permissionData, "Permission");
    }

    public async delete(id: number) {
        const repoResult = await this.repo!.delete(id);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        return super.responseData(200, repoResult.error, "Permission was deleted successfully");
    }

}