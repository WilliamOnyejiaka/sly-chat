import UserRepo from "./bases/UserRepo";

export default class Vendor extends UserRepo {

    public constructor() {
        super('vendor');
    }
}