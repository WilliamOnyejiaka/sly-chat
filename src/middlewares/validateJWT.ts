import { Request, Response, NextFunction } from 'express';
import { Token } from '../services';
import { http } from '../constants';
import { TokenBlackList } from '../cache';

const validateJWT = (types: string[], tokenSecret: string, neededData: string[] = ['data']) => async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        res.status(401).json({ error: true, message: 'Missing Bearer Authorization Header' });
        return;
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(401).json({
            error: true,
            message: "Token missing"
        });
        return;
    }
    const cache = new TokenBlackList();
    const isBlacklistedResult = await cache.get(token);

    if (isBlacklistedResult.error) {
        res.status(500).json({
            error: true,
            message: http('500')!
        });
        return;
    }

    if (isBlacklistedResult.data) {
        res.status(401).json({
            error: true,
            message: "Token is invalid"
        });
        return;
    }

    const tokenValidationResult: any = Token.validateToken(token, types, tokenSecret);

    if (tokenValidationResult.error) {
        const statusCode = tokenValidationResult.message == http("401") ? 401 : 400;
        res.status(statusCode).json({
            error: true,
            message: tokenValidationResult.message
        });
        return;
    }

    for (let item of neededData) {
        res.locals[item] = tokenValidationResult.data[item];
    }
    next();
}

export default validateJWT;