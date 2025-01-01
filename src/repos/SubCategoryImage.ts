import ImageRepo from "./bases/ImageRepo";

export default class SubCategoryImage extends ImageRepo {

    public constructor() {
        super('subCategoryImage', 'subCategoryId');
    }
}
