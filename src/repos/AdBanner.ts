import prisma from ".";
import AssetRepo from "./bases/AssetRepo";

export default class Product extends AssetRepo {

    public constructor() {
        super('adBanner', 'adBannerImage');
    }
}