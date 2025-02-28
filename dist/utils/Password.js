"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Password {
    static hashPassword(password, storedSalt) {
        // use this to generate the storedSalt crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto_1.default.pbkdf2Sync(password, storedSalt, 10000, 64, 'sha512')
            .toString('hex');
        return hashedPassword;
    }
    static compare(password, hashedPassword, storedSalt) {
        const derivedKey = crypto_1.default.pbkdf2Sync(password, storedSalt, 10000, 64, 'sha512');
        return derivedKey.toString('hex') === hashedPassword;
    }
}
exports.default = Password;
