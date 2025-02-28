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
const constants_1 = __importDefault(require("../constants"));
const config_1 = require("./../config");
class OTPCache {
    constructor(partPreKey) {
        this.preKey = "otp";
        this.expirationTime = 900;
        this.preKey = partPreKey + this.preKey;
    }
    set(email, otpCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const success = yield config_1.redisClient.set(`${this.preKey}-${email}`, otpCode, 'EX', this.expirationTime);
                return success === "OK";
            }
            catch (error) {
                console.error(`${(0, constants_1.default)("failedCache")}: ${error}`);
                return false;
            }
        });
    }
    get(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otpCode = yield config_1.redisClient.get(`${this.preKey}-${email}`);
                return {
                    error: false,
                    otpCode: otpCode
                };
            }
            catch (error) {
                console.error("Failed to get cached item: ", error);
                return {
                    error: true,
                    otpCode: null
                };
            }
        });
    }
    delete(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield config_1.redisClient.del(`${this.preKey}-${email}`);
                return result === 1 ? true : false;
            }
            catch (error) {
                console.error("Failed to delete cached item: ", error);
                return false;
            }
        });
    }
}
exports.default = OTPCache;
