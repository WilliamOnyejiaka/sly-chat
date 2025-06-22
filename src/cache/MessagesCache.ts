import { redisClient } from "../config";


export default class MessagesCache {

    private preKey = "chat:messages:";

    public async cacheMessages(room: string, message: any[]) {
        try {
            const cacheKey = this.preKey + room;
            // Add to Redis list (limit to 10 messages)
            await redisClient.lpush(cacheKey, ...message);
            await redisClient.ltrim(cacheKey, 0, 9); // Keep only the latest 10 messages
            await redisClient.expire(cacheKey, 3600); // Set TTL to 1 hour
            return true;
        } catch (error) {
            console.error("Error caching message: ", error);
            return false;
        }
    }

    public async findCachedMessages(room: string) {
        try {
            const cacheKey = this.preKey + room;
            const cacheMessages = await redisClient.lrange(cacheKey, 0, -1);
            return { error: false, data: cacheMessages }
        } catch (error) {
            console.error("Error retrieving cached messages: ", error);
            return { error: true, data: null }
        }
    }
}