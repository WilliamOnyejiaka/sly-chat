
import { Router, Request, Response } from "express";
import { AdminStore } from "../controllers";
import { adminAuthorization, bannerUploads, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const adminStore: Router = Router();

adminStore.get(
    "/paginate-stores",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(AdminStore.paginateStores)
);

adminStore.get(
    "/get-all-stores",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(AdminStore.getAllStores)
);

adminStore.get(
    "/:vendorId",
    adminAuthorization(['manage_all', 'manage_vendor']),
    asyncHandler(AdminStore.retrieveVendorStore)
);

adminStore.delete(
    "/:vendorId",
    asyncHandler(AdminStore.deleteStore)
);

export default adminStore;