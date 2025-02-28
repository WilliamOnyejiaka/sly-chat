"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const constants_1 = __importDefault(require("../constants"));
class BaseCache {
    constructor(preKey, expirationTime = 2592000) {
        this.preKey = preKey;
        this.expirationTime = expirationTime;
    }
    cacheResponse(error, message = null, data = {}) {
        return {
            error: error,
            message: message,
            data: data
        };
    }
    set(key, data, expirationTime) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const success = yield config_1.redisClient.set(`${this.preKey}-${key}`, JSON.stringify(data), 'EX', expirationTime !== null && expirationTime !== void 0 ? expirationTime : this.expirationTime);
                return success === "OK";
            }
            catch (error) {
                console.error(`${(0, constants_1.default)("failedCache")}: ${error}`);
                return false;
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield config_1.redisClient.get(`${this.preKey}-${key}`);
                return {
                    error: false,
                    data: item !== null && item !== void 0 ? item : JSON.parse(item),
                };
            }
            catch (error) {
                console.error("Failed to get cached item: ", error);
                return {
                    error: true,
                    data: null
                };
            }
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield config_1.redisClient.del(`${this.preKey}-${key}`);
                return result === 1;
            }
            catch (error) {
                console.error("Failed to delete cached item: ", error);
                return true;
            }
        });
    }
}
exports.default = BaseCache;
