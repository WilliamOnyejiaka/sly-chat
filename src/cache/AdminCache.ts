import BaseCache from "./BaseCache";

export default class AdminCache extends BaseCache {

    public constructor() {
        super('admin', 2_592_000);
    }
}