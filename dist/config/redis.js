"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const _1 = require(".");
const redisClient = new ioredis_1.default((0, _1.env)('redisURL'));
// const redisClient = new Redis("rediss://default:AVG-AAIjcDFiNjNiOTRkNjYwYTE0NjZkODNlMmNhODNhMGMyMTI3M3AxMA@quick-whale-20926.upstash.io:6379");
redisClient.on("connecting", () => {
    console.log("Redis Connecting...");
});
redisClient.on("connect", () => {
    console.log('redis running on port - ', redisClient.options.port);
});
redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});
exports.default = redisClient;
