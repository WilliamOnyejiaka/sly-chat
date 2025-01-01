import { NextFunction,Request,Response } from "express";
import { redisClient } from "./../config";


const redisClientMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.locals.redisClient = redisClient;
    next();
};

export default redisClientMiddleware;