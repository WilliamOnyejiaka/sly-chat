"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./../config");
const redisClientMiddleware = (req, res, next) => {
    res.locals.redisClient = config_1.redisClient;
    next();
};
exports.default = redisClientMiddleware;
