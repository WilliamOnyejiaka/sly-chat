import ImageRepo from "./bases/ImageRepo";

export default class VendorProfilePicture extends ImageRepo {

    public constructor() {
        super('vendorProfilePicture', 'vendorId');
    }
}