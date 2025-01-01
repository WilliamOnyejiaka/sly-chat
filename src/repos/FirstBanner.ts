import { ImageRepository } from "../interfaces/Repository";
import ImageRepo from "./bases/ImageRepo";

export default class FirstBanner extends ImageRepo {

    public constructor() {
        super('firstStoreBanner', 'storeId');
    }
}