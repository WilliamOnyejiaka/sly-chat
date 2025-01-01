import { ImageRepository } from "../interfaces/Repository";
import ImageRepo from "./bases/ImageRepo";

export default class SecondBanner extends ImageRepo {

    public constructor() {
        super('secondStoreBanner', 'storeId');
    }
}