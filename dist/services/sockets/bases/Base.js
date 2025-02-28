"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../../config");
class Base {
    responseData(statusCode, error, message = null, data = {}) {
        return {
            statusCode: statusCode,
            error: error,
            message: message,
            data: data
        };
    }
    handleRepoError(repoResult) {
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message);
        }
        return null;
    }
    handleServiceResultError(message, servicesResult) {
        config_1.logger.error(message);
        return this.responseData(servicesResult.statusCode, servicesResult.error, servicesResult.message);
    }
}
exports.default = Base;
