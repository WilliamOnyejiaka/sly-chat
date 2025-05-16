import { NextFunction, Response, Request } from "express";
import constants, { http } from "../constants";
import UserCache from "../cache/bases/UserCache";
import UserRepo from "../repos/bases/UserRepo";
import BaseService from "../services/bases/BaseService";

const validateUser = <T extends UserCache, U extends UserRepo>(cache: T, repo: U) => async (req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.data.id;
    const cacheResult = await cache.get(id);

    if (cacheResult.error) {
        res.status(500).json({
            error: true,
            message: http("500")!
        });
        return;

    }

    if (Object.keys(cacheResult.data).length === 0) {
        const user = await repo.getUserProfile(id);

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
            const service = new BaseService();
            const userType = res.locals.userType;
            const { data, cacheData } = service.sanitizeUserData(user.data, userType, repo);

            await cache.set(id, cacheData); //* Keep an eye on this
            next();
            return;

        }
    }

    next();
}

export default validateUser;