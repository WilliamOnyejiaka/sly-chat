import { Admin } from ".";
import constants, { http } from "../constants";
import { AdminPermission as AdminPermissionRepo } from "../repos";
import { AdminPermissionDto } from "../types/dtos";
import BaseService from "./bases/BaseService";

export default class AdminPermission extends BaseService<AdminPermissionRepo> {

    public constructor() {
        super(new AdminPermissionRepo());
    }

    public async getAdminPermissionAndPermissionWithAdminId(adminId: number) {
        const repoResult = await this.repo!.getAdminPermissionAndPermissionWithAdminId(adminId);

        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const permission = repoResult.data;
        const statusCode = permission ? 200 : 404;
        const error: boolean = !permission;
        const message = error ? "AdminPermission was not found" : constants('200AdminPermission')!;

        return super.responseData(statusCode, error, message, permission);
    }

    private async getAdminPermission(id: number, isAdmin: boolean = true) {
        const repoResult = isAdmin ? await this.repo!.getAdminPermissionWithAdminId(id) :
            await this.repo!.getAdminPermissionWithPermissionId(id);

        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const permission = repoResult.data;
        const statusCode = permission ? 200 : 404;
        const error: boolean = !permission;
        const message = error ? "AdminPermission was not found" : constants('200AdminPermission')!;

        return super.responseData(statusCode, error, message, permission);
    }

    public async getAdminPermissionWithRoleId(permissionId: number) {
        return await this.getAdminPermission(permissionId, false);
    }

    public async getPermissionWithAdminId(adminId: number) {
        return await this.getAdminPermission(adminId);
    }

    public async getAllAdminPermissions() {
        return await super.getAllItems(constants('200AdminPermissions')!);
    }

    public async createAdminPermission(adminPermissionData: AdminPermissionDto) {
        return await super.create<AdminPermissionDto>(adminPermissionData, "AdminPermission");
    }

    public async delete(id: number) {
        // const adminRepoResult = await (new Admin()).massUnassignRole(id);
        // if (adminRepoResult.json.error) {
        //     return Service.responseData(500, true, http('500')!);
        // }

        // const repoResult = await this.repo.deletePermission(id);
        // if (repoResult.error) {
        //     return Service.responseData(repoResult.type!, true, repoResult.message!);
        // }

        // return Service.responseData(200, !repoResult.error, "Permission was deleted successfully");
    }

}