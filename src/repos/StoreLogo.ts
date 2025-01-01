import ImageRepo from "./bases/ImageRepo";

export default class StoreLogo extends ImageRepo {

    public constructor() {
        super('storeLogo', 'storeId');
    }
}