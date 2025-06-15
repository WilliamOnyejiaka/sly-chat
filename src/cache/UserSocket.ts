import { logger, redisClient } from "../config";
import { UserType } from "../types/enums";

export default class UserSocket {

    protected readonly preKey: string;
    protected readonly expirationTime: number;
    protected readonly redisClient = redisClient;


    public constructor(expirationTime: number = 2_592_000) {
        this.preKey = `socket`;
        this.expirationTime = expirationTime;
    }

    protected cacheResponse(error: boolean, data: any = {}) {
        return {
            error: error,
            data: data
        }
    }

    protected key(userType: UserType, userId: number) {
        return `${userType}-${this.preKey}:${userId}`;
    }

    public async set(userType: UserType, userId: number, data: { chat: null | string, notification: null | string }) {
        try {
            const userKey = this.key(userType, userId);
            const pipeline = this.redisClient.pipeline();
            pipeline.hset(userKey, data);
            pipeline.expire(userKey, this.expirationTime);
            await pipeline.exec();
            logger.info(`🤝 ${userKey} was successfully cached`);
            return true;
        } catch (error) {
            logger.error(`🛑 Failed to store ${this.preKey} - ${userId}`);
            console.log(`Failed to cache ${this.preKey}: `, error);
            return false;
        }
    }

    public async get(userType: UserType, userId: number, cachedPart: string | null = null) {
        const userKey = this.key(userType, userId);
        try {
            let data = cachedPart == null ? await this.redisClient.hgetall(userKey) : await this.redisClient.hget(userKey, cachedPart!);
            return this.cacheResponse(false, data);
        } catch (error) {
            console.error("Failed to get cached item: ", error);
            return this.cacheResponse(true);
        }
    }

    public async delete(userType: UserType, userId: number) {
        try {
            const userKey = this.key(userType, userId);
            const result = await redisClient.del(userKey);
            return result === 1;
        } catch (error) {
            console.error("Failed to delete cached item: ", error);
            return true;
        }
    }
}