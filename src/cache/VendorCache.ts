import { logger } from "../config";
import { UserType } from "../types/enums";
import UserCache from "./bases/UserCache";

export default class VendorCache extends UserCache {

    public constructor() {
        super(UserType.Vendor);
    }
}