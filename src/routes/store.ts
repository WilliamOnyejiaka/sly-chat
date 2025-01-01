import { Router, Request, Response } from "express";
import { Store } from "../controllers";
import { bannerUploads, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { storeImagesUploads } from "../middlewares/multer";
import { paramNumberIsValid } from "../middlewares/validators/validators";

const store: Router = Router();

store.post(
    "/create-store",
    validateBody([
        'name',
        'address',
        'city',
        'description',
        'tagLine'
    ]),
    asyncHandler(Store.createStore)
);

store.post("/create-vendor-store",
    storeImagesUploads.any(),
    validateBody([
        'name',
        'address',
        'city',
        'description',
        'tagLine'
    ]),
    asyncHandler(Store.createAll)
);

store.post(
    "/upload-logo/:storeId",
    uploads.single("image"),
    [
        paramNumberIsValid('storeId')
    ],
    asyncHandler(Store.uploadStoreLogo)
);

store.post(
    "/upload-first-banner/:storeId",
    uploads.single("image"),
    [
        paramNumberIsValid('storeId')
    ],
    asyncHandler(Store.uploadFirstBanner())
);

store.post(
    "/upload-second-banner/:storeId",
    uploads.single("image"),
    [
        paramNumberIsValid('storeId')
    ],
    asyncHandler(Store.uploadSecondBanner())
);

store.post(
    "/upload-banners/:storeId",
    bannerUploads.any(),
    [
        paramNumberIsValid('storeId')
    ],
    asyncHandler(Store.uploadBanners)
);

store.get("/", asyncHandler(Store.getStoreAll));

store.delete(
    "/",
    asyncHandler(Store.deleteStore)
);

export default store;