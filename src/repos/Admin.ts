import prisma from ".";
import UserRepo from "./bases/UserRepo";
export default class Admin extends UserRepo {

    public constructor() {
        super('admin', 'profilePicture');
    }

    private async getAdminAndRole(idOrEmail: number | string) { // TODO: Rename this method
        const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };

        try {
            const admin = await (prisma['admin'] as any).findUnique({ // TODO: change this, use getAllRelations (not the name of the class but you get the point) in the Repo class
                where: where,
                include: {
                    role: {
                        select: {
                            name: true,
                            description: true,
                            RolePermission: {
                                select: {
                                    permission: true,
                                }
                            },
                        }
                    },
                    directPermissions: {
                        select: {
                            permission: true
                        }
                    },
                    profilePicture: {
                        select: {
                            imageUrl: true
                        }
                    }
                },
            });
            return super.repoResponse(false, 200, null, admin);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async getAdminAndRoleWithId(id: number) {
        return await this.getAdminAndRole(id);
    }

    public async getAdminAndRoleWithEmail(email: string) {
        return await this.getAdminAndRole(email);
    }

    public async getAdmin(id: number) {
        return await super.getItemWithId(id);
    }

    public async assignRole(adminId: number, roleId: number) {
        return await super.update({ id: adminId }, { roleId: roleId });
    }

    public async massUnassignRole(roleId: number) {
        try {
            await (prisma['admin'] as any).updateMany({
                where: {
                    roleId: roleId
                },
                data: {
                    roleId: null,
                },
            });
            return super.repoResponse(false, 200);
        } catch (error) {
            return super.handleDatabaseError(error);
        }
    }

    public async deleteAdmin(adminId: number) {
        return await super.delete({ id: adminId });
    }

}