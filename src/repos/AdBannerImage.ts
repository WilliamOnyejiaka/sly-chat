import { ImageRepository } from "../interfaces/Repository";
import ImageRepo from "./bases/ImageRepo";

export default class AdBannerImage extends ImageRepo {

    public constructor() {
        super('adBannerImage', 'adBannerId');
    }
}