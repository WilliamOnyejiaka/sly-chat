import UserRepo from "./bases/UserRepo";

export default class Customer extends UserRepo {

    public constructor() {
        super('customer');
    }
}