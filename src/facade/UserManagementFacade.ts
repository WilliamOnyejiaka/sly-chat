import VendorDto, { AdminDto, CustomerAddressDto } from "../types/dtos";
import { UserType } from "../types/enums";
import { Password } from "../utils";
import BaseUserFacade from "./bases/BaseUserFacade";

export default class UserManagementFacade extends BaseUserFacade {

    public async createAdmin(createData: AdminDto, createdBy: number) {
        return await this.adminService.createAdmin(createData, createdBy);
    }

    public async createVendor(vendorDto: VendorDto) {
        return await this.vendorService.createVendor(vendorDto);
    }

    public async createCustomer(customerData: {
        firstName: string,
        lastName: string,
        password: string,
        email: string,
        phoneNumber: string
    }, addressData: CustomerAddressDto) {
        return await this.customerService.createCustomer(customerData, addressData);
    }

    public async paginateUsers(page: number, pageSize: number, user: UserType) {
        const userService = this.getUserService(user);
        if (!userService) return this.service.responseData(500, true, "Invalid user");
        return await userService.paginateUsers(page, pageSize);
    }

    public async getAllUsers(user: UserType) {
        const userService = this.getUserService(user);
        if (!userService) return this.service.responseData(500, true, "Invalid user");
        return await userService.getAllUsers();
    }

    private async toggleActiveStatus(userId: number, user: UserType, activate: boolean = true) {
        const userService = this.getUserService(user);
        if (!userService) return this.service.responseData(500, true, "Invalid user");
        return activate ? await userService.activateUser(userId) : await userService.deActivateUser(userId);
    }

    public async deactivateUser(userId: number, user: UserType) {
        return this.toggleActiveStatus(userId, user, false);
    }

    public async activateUser(userId: number, user: UserType) {
        return this.toggleActiveStatus(userId, user);
    }

    public async totalUsers(user: UserType) {
        const userService = this.getUserService(user);
        if (!userService) return this.service.responseData(500, true, "Invalid user");
        return await userService.totalRecords();
    }

    public async assignAdminRole(adminId: number, roleId: number) {
        return await this.adminService.assignRole(adminId, roleId);
    }

    public async generateAdminSignUpKey(roleId: number, createdBy: number) {
        return await this.adminService.generateAdminSignUpKey(roleId, createdBy);
    }
}