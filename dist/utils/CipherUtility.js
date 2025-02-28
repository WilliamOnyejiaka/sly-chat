"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = __importDefault(require("crypto-js"));
const config_1 = require("../config");
class CipherUtility {
    static encrypt(text, secretKey) {
        const encrypted = crypto_js_1.default.AES.encrypt(text, secretKey).toString();
        return encrypted;
    }
    static decrypt(encryptedText, secretKey) {
        try {
            const bytes = crypto_js_1.default.AES.decrypt(encryptedText, secretKey);
            const originalText = bytes.toString(crypto_js_1.default.enc.Utf8);
            return {
                error: false,
                originalText: originalText
            };
        }
        catch (error) {
            config_1.logger.error(error);
            return {
                error: true,
                originalText: null
            };
        }
    }
}
exports.default = CipherUtility;
