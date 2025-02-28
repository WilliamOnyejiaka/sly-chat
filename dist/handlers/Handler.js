"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Handler {
    static responseData(statusCode, error, message, data = {}) {
        return {
            statusCode: statusCode,
            error: error,
            message: message,
            data: data
        };
    }
    static handleRepoError(repoResult) {
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message);
        }
        return null;
    }
}
exports.default = Handler;
