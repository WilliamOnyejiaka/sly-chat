import { Router, Request, Response } from "express";
import { Vendor } from "../controllers";
import { uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const vendor: Router = Router();

vendor.post(
    "/upload-profile-pic",
    uploads.single("image"),
    asyncHandler(Vendor.uploadProfilePicture)
);

vendor.patch(
    "/update-first-name",
    validateBody(['firstName']),
    asyncHandler(Vendor.updateFirstName)
);

vendor.patch(
    "/update-last-name",
    validateBody(['lastName']),
    asyncHandler(Vendor.updateLastName)
);

vendor.patch(
    "/update-email",
    validateBody(['email']),
    asyncHandler(Vendor.updateEmail)
);

// vendor.get(
//     "/",
//     asyncHandler(Vendor.getVendor)
// );

vendor.get(
    "/",
    asyncHandler(Vendor.getVendorAll)
);

vendor.delete(
    "/",
    asyncHandler(Vendor.delete)
);

export default vendor;