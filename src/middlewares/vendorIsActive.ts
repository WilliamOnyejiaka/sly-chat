import { Request, Response, NextFunction } from 'express';
import { VendorCache } from "../cache";
import { http } from '../constants';

const vendorIsActive = async (req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.data.id;
    const cache = new VendorCache();
    const cacheResult = await cache.get(String(id));
    if (cacheResult.error) {
        res.status(500).json({
            error: true,
            message: http('500')!,
            data: null
        });
        return;
    }

    if (!cacheResult.data.active) {
        res.status(400).json({
            error: true,
            message: "Vendor account has been deactivated please contact an administrator",
            data: null
        });
        return;
    }

    next();
}

export default vendorIsActive;