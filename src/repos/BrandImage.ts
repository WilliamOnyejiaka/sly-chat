import prisma from ".";
import ImageRepo from "./bases/ImageRepo";

export default class BrandImage extends ImageRepo {

    public constructor() {
        super('brandImage', 'brandId');
    }
}
