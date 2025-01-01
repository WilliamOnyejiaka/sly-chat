import { Role } from ".";
import constants, { http, HttpStatus } from "../constants";
import { Admin as AdminRepo, AdminProfilePicture } from "../repos";
import { CipherUtility, Password } from "../utils";
import { env } from "../config";
import { AdminDto } from "../types/dtos";
import UserService from "./bases/UserService";
import { AdminCache, AdminKey } from "../cache";
export default class Admin extends UserService<AdminRepo, AdminCache, AdminProfilePicture> {

    private readonly roleService: Role = new Role();

    public constructor() {
        super(new AdminRepo(), new AdminCache(), new AdminProfilePicture(), 'adminProfilePic');
    }

    public async defaultAdmin(roleId: number) {
        const email = env('defaultAdminEmail')!
        const emailExistsResult = await super.emailExists(email);

        if (emailExistsResult.json.error) {
            return emailExistsResult;
        }

        const roleExistsResult = await this.roleService.getRoleWithId(roleId);

        if (roleExistsResult.json.error) {
            return roleExistsResult;
        }

        if (roleExistsResult.json.data) {
            let defaultAminData = {
                firstName: "Super",
                lastName: "Admin",
                email: email,
                roleId: roleId,
                active: true,
                password: env('defaultAdminPassword')!
            }
            const passwordHash = Password.hashPassword(defaultAminData.password, env("storedSalt")!);
            defaultAminData.password = passwordHash;

            const repoResult = await this.repo!.insert(defaultAminData);
            const error: boolean = repoResult.error;
            const statusCode = repoResult.type;
            const message: string = !error ? "Admin has been created successfully" : http("500")!;
            const result = repoResult.data;

            if (!error) {
                return super.responseData(statusCode, error, message);
            }
            return super.responseData(statusCode, error, message, result);
        }
        return roleExistsResult;
    }

    public async getAdminWithEmail(email: string) {
        const repoResult = await this.repo!.getUserProfileWithEmail(email);
        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const admin = repoResult.data;
        const statusCode = admin ? 200 : 404;
        const error: boolean = admin ? false : true;
        const message = error ? http("404")! : "Admin has been retrieved";

        if (!error) {
            delete (repoResult.data as any).password;
        }

        return super.responseData(statusCode, error, message, admin);
    }

    public async getAdminAndRole(id: number) {
        const repoResult = await this.repo!.getAdminAndRoleWithId(id);
        if (repoResult.error) {
            return super.responseData(500, true, http("500") as string);
        }

        const admin = repoResult.data;
        const statusCode = admin ? 200 : 404;
        const error: boolean = admin ? false : true;
        const message = error ? http("404")! : "Admin has been retrieved";

        if (!error) {
            delete repoResult.data.password;
        }

        return super.responseData(statusCode, error, message, admin);
    }

    public async createAdmin(createData: AdminDto, createdBy: number) {
        const roleExistsResult = await this.roleService.getRoleWithId(createData.roleId);

        if (roleExistsResult.json.error) {
            return roleExistsResult;
        }

        if (roleExistsResult.json.data) {
            const passwordHash = Password.hashPassword(createData.password!, env("storedSalt")!);
            createData.password = passwordHash;
            createData.createdBy = createdBy;

            const repoResult = await this.repo!.insert(createData);
            const error: boolean = repoResult.error
            const statusCode = repoResult.type;
            const message: string = !error ? "Admin has been created successfully" : repoResult.message!;
            const result = repoResult.data

            if (!error) {
                delete result.password;
                return super.responseData(statusCode, error, message, result);
            }
            return super.responseData(statusCode, error, message, result);
        }

        return roleExistsResult;
    }

    public async generateAdminSignUpKey(roleId: number, createdBy: number) {
        const keyCache = new AdminKey();
        const secretKey: string = env('secretKey')!;
        const key = CipherUtility.encrypt(JSON.stringify({ roleId, createdBy }), secretKey);

        const cached = await keyCache.set(key);
        if (!cached) {
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }
        return super.responseData(HttpStatus.OK, false, "Key has been generated successfully", { key });
    }

    // public async deleteAdmin(adminId: number) {
    //     const repoResult = await this.repo!.deleteAdmin(adminId);
    //     if (repoResult.error) {
    //         return super.responseData(repoResult.type, true, repoResult.message!);
    //     }

    //     return super.responseData(200, repoResult.error, "Admin was deleted successfully");
    // }

    // private async toggleActiveStatus(id: number, activate: boolean = true) {
    //     const repoResult = activate ? await this.repo!.updateActiveStatus(id, true) : await this.repo!.updateActiveStatus(id, false);
    //     if (repoResult.error) {
    //         const message = repoResult.type == 404 ? constants('404Admin')! : http('500')!; // TODO: remove this line
    //         return super.responseData(repoResult.type!, true, message);
    //     }
    //     const message = activate ? "Admin was activated successfully" : "Admin was deactivated successfully";
    //     return super.responseData(200, false, message);
    // }

    // public async deactivateAdmin(id: number) {
    //     return this.toggleActiveStatus(id, false);
    // }

    // public async activateAdmin(id: number) {
    //     return this.toggleActiveStatus(id);
    // }

    public async paginateRoles(page: number, pageSize: number) {
        return await this.roleService.paginateRoles(page, pageSize);
    }

    public async massUnassignRole(roleId: number) {
        const repoResult = await this.repo!.massUnassignRole(roleId); // ! TODO: - try removing this method
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        return super.responseData(200, false, "Mass UnAssignment was successfully");
    }

    public async assignRole(adminId: number, roleId: number) {
        const repoResult = await this.repo!.assignRole(adminId, roleId);
        const error = super.handleRepoError(repoResult);
        if (error) return error;
        return super.responseData(200, false, "Role was assigned successfully");
    }

    public async assignPermission(adminId: number, permissionId: number) {
        const repoResult = await this.repo!.assignRole(adminId, permissionId); // TODO: wrong method
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        return super.responseData(200, false, "Permission was assigned successfully");
    }

    public async getRoleWithId(roleId: number) {
        return await this.roleService.getRoleWithId(roleId);
    }
}