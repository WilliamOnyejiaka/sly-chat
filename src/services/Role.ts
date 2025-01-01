import { Admin } from ".";
import constants, { http } from "../constants";
import { Role as RoleRepo } from "../repos";
import { RoleDto } from "../types/dtos";
import BaseService from "./bases/BaseService";

export default class Role extends BaseService<RoleRepo> {

    public constructor() {
        super(new RoleRepo());
    }

    public async createRole(roleData: RoleDto) {
        return await super.create<RoleDto>(roleData, "Role");
    }

    public async getRoleWithName(roleName: string) {
        const repoResult = await this.repo!.getItemWithName(roleName);


        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const role = repoResult.data;
        const statusCode = role ? 200 : 404;
        const error: boolean = !role;
        const message = error ? "Role was not found" : constants('200Role')!;

        return super.responseData(statusCode, error, message, role);
    }

    public async getRoleWithId(roleId: number) {
        return await super.getItemWithId(roleId);
    }

    public async getAllRoles() {
        return await super.getAllItems(constants('200Roles')!);
    }

    public async paginateRoles(page: number, pageSize: number) {
        return await super.paginate(page, pageSize);
    }

    public async delete(id: number) {
        const adminServiceResult = await (new Admin()).massUnassignRole(id);
        if (adminServiceResult.json.error) {
            return adminServiceResult
        }

        const repoResult = await this.repo!.delete(id);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        return super.responseData(200, !repoResult.error, "Role was deleted successfully");
    }

}