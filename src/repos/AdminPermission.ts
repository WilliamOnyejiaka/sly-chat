import prisma from ".";
import { PermissionDto } from "../types/dtos";
import Repo from "./bases/Repo"


export default class AdminPermission extends Repo {

    public constructor() {
        super('adminPermission');
    }

    public async insertAdminPermission(data: any) {
        return await super.insert(data)
    }

    private async getAdminPermissionAndPermission(id: number, isAdmin: boolean = true) {
        const where = isAdmin ? { adminId: id } : { permissionId: id };

        try {
            const adminPermission = await prisma.adminPermission.findMany({
                where: where,
                include: {
                    permission: true
                }
            })
            return super.repoResponse(false, 200, null, adminPermission);

        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async getAdminPermissionAndPermissionWithAdminId(adminId: number) {
        return await this.getAdminPermissionAndPermission(adminId);
    }

    public async getAdminPermissionWithPermissionId(permissionId: number) {
        return await super.getItem({ permissionId: permissionId });
    }

    public async getAdminPermissionWithAdminId(adminId: number) {
        return await super.getItem({ adminId: adminId });
    }

    public async deleteAdminPermission(adminId: number, roleId: number) {
        return super.delete({ adminId: adminId, roleId: roleId })
    }

    public async getAllAdminPermission() {
        return await super.getAll();
    }

    public async paginateAdminPermission(skip: number, take: number) {
        return super.paginate(skip, take);
    }
}