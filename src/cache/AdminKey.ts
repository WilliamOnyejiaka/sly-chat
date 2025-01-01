import BaseCache from "./BaseCache";

export default class AdminKey extends BaseCache {

    public constructor() {
        super('adminKey', 900);
    }

    public async set(key: string, data: any = "adminKey", expirationTime?: number): Promise<boolean> {
        return await super.set(key,data);
    }
}