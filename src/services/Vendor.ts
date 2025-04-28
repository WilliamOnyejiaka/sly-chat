import UserService from "./bases/UserService";
import { Vendor as VendorRepo } from "../repos";

export default class Vendor extends UserService<VendorRepo> {

    public constructor() {
        super(new VendorRepo())
    }
}