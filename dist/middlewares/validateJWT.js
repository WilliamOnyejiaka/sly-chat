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
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const constants_1 = require("../constants");
const cache_1 = require("../cache");
const validateJWT = (types, tokenSecret, neededData = ['data']) => (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = socket.handshake.auth.token || socket.handshake.headers['token'];
    if (!token) {
        socket.emit('appError', {
            error: true,
            message: "Token missing",
            statusCode: 401
        });
        return;
    }
    const cache = new cache_1.TokenBlackList();
    const isBlacklistedResult = yield cache.get(token);
    if (isBlacklistedResult.error) {
        socket.emit('appError', {
            error: true,
            message: (0, constants_1.http)('500'),
            statusCode: 500
        });
        return;
    }
    if (isBlacklistedResult.data) {
        socket.emit('appError', {
            error: true,
            message: "Token is invalid",
            statusCode: 401
        });
        return;
    }
    const tokenValidationResult = services_1.Token.validateToken(token, types, tokenSecret);
    if (tokenValidationResult.error) {
        const statusCode = tokenValidationResult.message == (0, constants_1.http)("401") ? 401 : 400;
        socket.emit('appError', {
            error: true,
            message: tokenValidationResult.message,
            statusCode: statusCode
        });
        return;
    }
    socket.locals = {};
    for (let item of neededData) {
        socket.locals[item] = tokenValidationResult.data[item];
    }
    socket.locals['userType'] = tokenValidationResult.data['types'][0];
    next();
});
exports.default = validateJWT;
