"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = secureApi;
const config_1 = require("../config");
function secureApi(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
        res.status(401).json({
            error: true,
            message: 'API key is missing',
        });
        return;
    }
    const validApiKey = (0, config_1.env)('apiKey');
    if (apiKey !== validApiKey) {
        res.status(403).json({
            error: true,
            message: 'Invalid API key',
        });
        return;
    }
    next();
}
