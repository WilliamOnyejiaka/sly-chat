import constants, { http, urls } from "../constants";
import { CustomerProfilePic, Customer as CustomerRepo } from "../repos";
import { CustomerCache } from "../cache";
import UserService from "./bases/UserService";
import { Password } from "../utils";
import { CustomerAddressDto } from "../types/dtos";

export default class Customer extends UserService<CustomerRepo, CustomerCache, CustomerProfilePic> {

    public constructor() {
        super(new CustomerRepo(), new CustomerCache(), new CustomerProfilePic(), 'customerProfilePic');
    }

    public async createCustomer(
        customerData: {
            firstName: string,
            lastName: string,
            password: string,
            email: string,
            phoneNumber: string
        }, addressData: CustomerAddressDto) {

        const passwordHash: string = Password.hashPassword(customerData.password, this.storedSalt);
        customerData.password = passwordHash;

        const repoResult = await this.repo!.insert({ customerData, addressData });
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const customer = repoResult.data!;
        delete customer.password;
        return super.responseData(201, false, "Customer has been created successfully");
    }

    public async delete(customerId: number) {
        const repoResult = await this.repo!.deleteWithId(customerId); // ! TODO: add cloudinary delete
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        const deleted = await this.cache.delete(String(customerId));

        return deleted ?
            super.responseData(200, false, "Customer was deleted successfully") :
            super.responseData(500, true, http('500')!);
    }

    public async getAllCustomers() {
        const repoResult = await this.repo!.getAll();

        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message!);
        }

        super.sanitizeUserImageItems(repoResult.data);
        return super.responseData(200, false, constants('200Customers')!, repoResult.data);
    }
}