import { Admin, Permission, Role } from "../services";
import { AdminDto, PermissionDto, RoleDto } from "../types/dtos";

export default class AdminManagementFacade {

    private readonly adminService: Admin = new Admin();
    private readonly roleService: Role = new Role();
    private readonly permissionService: Permission = new Permission();

    public constructor() {
    }

    public async createAdmin(createData: AdminDto, adminId: number) {
        return await this.adminService.createAdmin(createData, adminId);
    }

    public async createRole(roleData: RoleDto) {
        return await this.roleService.createRole(roleData);
    }

    public async createPermission(permissionData: PermissionDto) {
        return await this.permissionService.createPermission(permissionData);
    }


}