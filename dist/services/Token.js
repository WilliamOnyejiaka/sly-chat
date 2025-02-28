"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../constants");
class Token {
    static validateToken(token, types, tokenSecret) {
        let result = {};
        try {
            result = jsonwebtoken_1.default.verify(token, tokenSecret);
        }
        catch (err) {
            console.error("\nError: ", err.message, "\n");
            const message = err.message[0].toUpperCase() + err.message.slice(1);
            return {
                error: true,
                message: message,
                data: {}
            };
        }
        let validTypes = true;
        if (types.includes("any")) {
            return {
                error: false,
                message: null,
                data: result
            };
        }
        else {
            for (const type of result.types) {
                if (!types.includes(type)) {
                    validTypes = false;
                    break;
                }
            }
        }
        return validTypes ? {
            error: false,
            message: null,
            data: result
        } : {
            error: true,
            message: (0, constants_1.http)("401"),
            data: {}
        };
    }
    static createToken(secretKey, data, types = ["access"]) {
        return jsonwebtoken_1.default.sign({ data: data, types: types }, secretKey, { expiresIn: "30d" });
    }
    static decodeToken(token) {
        const decoded = jsonwebtoken_1.default.decode(token);
        const expiresAt = decoded.exp - Math.floor(Date.now() / 1000); // Token's remaining time-to-live
        return {
            expiresAt: expiresAt,
            data: decoded.data,
            types: decoded.types,
            issuedAt: decoded.iat
        };
    }
}
exports.default = Token;
