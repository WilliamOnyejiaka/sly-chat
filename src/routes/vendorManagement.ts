import { Router, Request, Response } from "express";
import { VendorManagement } from "../controllers";
import { adminAuthorization, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { adminAuth, anyAuth, deleteVendor, getVendor, paginateVendors, updateActiveStatus } from "../middlewares/validators/vendorManagement";
import { UserType } from "../types/enums";

const vendorManagement: Router = Router();

vendorManagement.get(
    "/paginate-vendors",
    paginateVendors,
    asyncHandler(VendorManagement.paginateVendors)
);

vendorManagement.get(
    "/get-all-vendors",
    anyAuth,
    asyncHandler(VendorManagement.getAllVendors)
);

vendorManagement.get(
    "/total-records",
    anyAuth,
    asyncHandler(VendorManagement.totalRecords)
);

vendorManagement.patch(
    "/deactivate-vendor",
    updateActiveStatus,
    asyncHandler(VendorManagement.deactivateVendor())
);

vendorManagement.patch(
    "/activate-vendor",
    updateActiveStatus,
    asyncHandler(VendorManagement.activateVendor())
);

vendorManagement.get(
    "/:vendorId",
    getVendor,
    asyncHandler(VendorManagement.getVendor)
);

vendorManagement.delete(
    "/:vendorId",
    deleteVendor,
    asyncHandler(VendorManagement.delete)
);

export default vendorManagement; 
