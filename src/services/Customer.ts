import UserService from "./bases/UserService";
import { Customer as CustomerRepo } from "../repos";

export default class Customer extends UserService<CustomerRepo> {

    public constructor() {
        super(new CustomerRepo())
    }
}