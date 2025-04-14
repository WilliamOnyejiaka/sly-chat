import Redis from 'ioredis';
import { env } from '.'; 
import RedisStore from 'rate-limit-redis';

const redisClient = new Redis(env('redisURL')!);

redisClient.on("connecting",() => {
    console.log("Redis Connecting...");
})

redisClient.on("connect", () => {
    console.log('redis running on port - ',redisClient.options.port);
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export const store = new RedisStore({
    // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
    sendCommand: (...args: string[]) => redisClient.call(...args),
});

export default redisClient;
