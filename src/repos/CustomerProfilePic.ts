import prisma from ".";
import ImageRepo from "./bases/ImageRepo";

export default class CustomerProfilePic extends ImageRepo {

    public constructor() {
        super('customerProfilePic', 'customerId');
    }

}
