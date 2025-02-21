import { adminAuthorization, validateBody } from "..";
import { pageQueryIsValid, pageSizeQueryIsValid, paramNumberIsValid } from "../validators";

export const anyAuth = adminAuthorization(['any']);
export const adminAuth = adminAuthorization(['manage_all', 'manage_vendor']);

const validVendorId = paramNumberIsValid('vendorId');

export const updateActiveStatus = [
    adminAuth,
    validateBody(['vendorId']),
]

export const getVendor = [
    anyAuth,
    validVendorId
]

export const paginateVendors = [
    anyAuth,
    pageQueryIsValid,
    pageSizeQueryIsValid
]

export const deleteVendor = [
    adminAuth,
    validVendorId
]