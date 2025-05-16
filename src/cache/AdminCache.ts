import { UserType } from "../types/enums";
import UserCache from "./bases/UserCache";

export default class AdminCache extends UserCache {

    public constructor() {
        super(UserType.Admin);
    }
}