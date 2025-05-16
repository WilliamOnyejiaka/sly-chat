import { UserType } from "../types/enums";
import UserCache from "./bases/UserCache";

export default class CustomerCache extends UserCache {

    public constructor() {
        super(UserType.Customer);
    }
}