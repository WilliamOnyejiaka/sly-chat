import { Request, Response, NextFunction } from 'express';
import { Token } from '../services';
import { http } from '../constants';
import { TokenBlackList } from '../cache';
import { ISocket } from '../types';

const validateHttpJWT = (types: string[], tokenSecret: string, neededData: string[] = ['data']) => async (socket: ISocket, next: (err?: any) => void) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['token'];
    if (!token) {
        socket.emit('appError', {
            error: true,
            message: "Token missing",
            statusCode: 401
        });
        return;
    }
    const cache = new TokenBlackList();
    const isBlacklistedResult = await cache.get(token);

    if (isBlacklistedResult.error) return next({
        statusCode: 401,
        message: "User Id is missing",
        type: "MISSING_KEY"
    });


    if (isBlacklistedResult.data) return next({
        error: true,
        message: "Token is invalid",
        statusCode: 401
    });

    const tokenValidationResult: any = Token.validateToken(token, types, tokenSecret);

    if (tokenValidationResult.error) {
        const statusCode = tokenValidationResult.message == http("401") ? 401 : 400;
        return next({
            error: true,
            message: tokenValidationResult.message,
            statusCode: statusCode
        });
    }

    socket.locals = {};
    for (let item of neededData) {
        socket.locals[item] = tokenValidationResult.data[item];
    }
    socket.locals['userType'] = tokenValidationResult.data['types'][0];

    next();
}

export default validateHttpJWT;