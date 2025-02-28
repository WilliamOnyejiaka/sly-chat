"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = baseUrl;
function baseUrl(req) {
    const protocol = req.protocol; // 'http' or 'https'
    const host = req.get("host");
    const fullUrl = `${protocol}://${host}`;
    return fullUrl;
}
