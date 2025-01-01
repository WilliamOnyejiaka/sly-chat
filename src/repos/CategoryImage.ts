import ImageRepo from "./bases/ImageRepo";

export default class CategoryImage extends ImageRepo {

    public constructor() {
        super('categoryImage', 'categoryId');
    }
}
