import RedisStore from "rate-limit-redis";
import { redisClient } from "../../config";
import rateLimit from "express-rate-limit";
import { store } from "../../config/redis";

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 5, // Max 5 requests per IP
    store: store,
    message: 'Too many requests, please try again later.',
});