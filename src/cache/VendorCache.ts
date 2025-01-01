import BaseCache from "./BaseCache";

export default class VendorCache extends BaseCache {

    public constructor() {
        super('vendor', 2_592_000);
    }
}