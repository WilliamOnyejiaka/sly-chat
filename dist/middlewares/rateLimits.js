"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilePicRateLimit = void 0;
const express_rate_limit_1 = require("express-rate-limit");
function rateLimitHandler(message = "Too many requests, please try again later") {
    return (req, res) => {
        return res.status(429).json({
            error: true,
            message: message,
        });
    };
}
exports.profilePicRateLimit = (0, express_rate_limit_1.rateLimit)({
    windowMs: 3 * 1000,
    max: 1,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    statusCode: 429,
    handler: rateLimitHandler()
});
