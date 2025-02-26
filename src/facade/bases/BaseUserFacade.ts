import { Customer, Vendor } from "../../services";
import { UserType } from "../../types/enums";
import BaseFacade from "./BaseFacade";

export default class BaseUserFacade extends BaseFacade {

    protected readonly customerService: Customer = new Customer();
    protected readonly adminService = new Vendor();
    protected readonly vendorService: Vendor = new Vendor();

    protected getUserService(user: UserType) {
        const services = {
            [UserType.Admin]: this.adminService,
            [UserType.Vendor]: this.vendorService,
            [UserType.Customer]: this.customerService,
        };
        return services[user] || null;
    }

    public async createUser(userData: any, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.httpResponseData(500, true, "Invalid user");
        return await service.createUser(userData);
    }

    public async getUserProfileWithId(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.httpResponseData(500, true, "Invalid user");
        return await service.getUserProfileWithId(userId);
    }

    public async getUserProfileWithEmail(userEmail: string, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.httpResponseData(500, true, "Invalid user");
        return await service.getUserProfileWithEmail(userEmail);
    }

    public async deleteUser(userId: number, user: UserType) {
        const service = this.getUserService(user);
        if (!service) return this.service.httpResponseData(500, true, "Invalid user");
        return await service.deleteUser(userId);
    }
}
