import { logger, redisClient } from "../../config";
import constants from "../../constants";
import { UserType } from "../../types/enums";

export default class UserCache {

    protected readonly preKey: string;
    protected readonly expirationTime: number;
    protected readonly redisClient = redisClient;


    public constructor(preKey: UserType, expirationTime: number = 2_592_000) {
        this.preKey = preKey;
        this.expirationTime = expirationTime;
    }

    protected cacheResponse(error: boolean, data: any = {}) {
        return {
            error: error,
            data: data
        }
    }

    protected key(userId: number) {
        return `${this.preKey}:${userId}`;
    }

    public async set(userId: number, data: any) {
        try {
            const userKey = this.key(userId);
            const pipeline = this.redisClient.pipeline();
            pipeline.hset(userKey, data);
            pipeline.expire(userKey, this.expirationTime);
            await pipeline.exec();
            logger.info(`🤝 ${this.preKey} - ${userId} was successfully cached`);
            return true;
        } catch (error) {
            logger.error(`🛑 Failed to store ${this.preKey} - ${userId}`);
            console.log(`Failed to cache ${this.preKey}: `, error);
            return false;
        }
    }

    public async get(userId: number, cachedPart: string | null = null) {
        const userKey = this.key(userId);
        try {
            let data = cachedPart == null ? await this.redisClient.hgetall(userKey) : await this.redisClient.hget(userKey, cachedPart!);
            return this.cacheResponse(false, data);
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return this.cacheResponse(true);
        }
    }

    public async delete(userId: number) {
        try {
            const userKey = this.key(userId);
            const result = await redisClient.del(userKey);
            return result === 1;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return true;
        }
    }
}