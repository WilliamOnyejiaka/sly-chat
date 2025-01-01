import { NextFunction, Response, Request } from "express";
import constants, { http } from "../constants";
import Repository from "../interfaces/Repository";
import Cache from "../interfaces/Cache";
import BaseCache from "../cache/BaseCache";

const validateUser = <T extends BaseCache, U extends Repository>(cache: T, repo: U) => async (req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.data.id;
    const cacheResult = await cache.get(String(id));

    if (cacheResult.error) {
        res.status(500).json({
            error: true,
            message: http("500")!
        });
        return;

    }

    if (!cacheResult.data) {
        const user = await repo.getUserWithId!(id);

        if (user.error) {
            res.status(404).json({
                error: true,
                message: constants('404User')
            });
            return;
        }

        if (!user.data) {
            res.status(404).json({
                error: true,
                message: constants('404User')
            });
            return;
        } else {
            cache.set(id, user.data);
            next();
            return;

        }
    }

    next();
}

export default validateUser;