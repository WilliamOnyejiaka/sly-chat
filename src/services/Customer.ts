import constants, { http, urls } from "../constants";
import { CustomerProfilePic, Customer as CustomerRepo } from "../repos";
import { CustomerCache } from "../cache";
import UserService from "./bases/UserService";
import { Password } from "../utils";
import { CustomerAddressDto } from "../types/dtos";

export default class Customer extends UserService<CustomerRepo, CustomerCache, CustomerProfilePic> {

    public constructor() {
        super(new CustomerRepo(), new CustomerCache(), new CustomerProfilePic());
    }
}