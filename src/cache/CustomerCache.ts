import BaseCache from "./BaseCache";

export default class CustomerCache extends BaseCache {

    public constructor() {
        super('customer', 2_592_000);
    }
}