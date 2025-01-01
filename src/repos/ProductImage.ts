import { ImageRepository } from "../interfaces/Repository";
import ImageRepo from "./bases/ImageRepo";

export default class ProductImage extends ImageRepo {

    public constructor() {
        super('productImage', 'productId');
    }
}