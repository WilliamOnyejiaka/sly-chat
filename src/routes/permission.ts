import { Router, Request, Response, NextFunction } from "express";
import { Permission } from "../controllers";
import { adminAuthorization, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";

const permission: Router = Router();

permission.get(
    "/paginate-permissions",
    adminAuthorization(['any']),
    validateQueryParams([
        {
            name: "page",
            type: "number"
        },
        {
            name: "pageSize",
            type: "number"
        }
    ]),
    asyncHandler(Permission.paginatePermissions())
);

permission.get(
    "/get-permission-with-id/:permissionId",
    adminAuthorization(['any']),
    asyncHandler(Permission.getPermissionWithId)
);

permission.get(
    "/get-permission-with-name/:permissionName",
    adminAuthorization(['any']),
    asyncHandler(Permission.getPermissionWithName)
);

permission.post(
    "/create-permission",
    adminAuthorization(['manage_all']),
    validateBody([
        "name",
        "description"
    ]),
    asyncHandler(Permission.createPermission)
);

permission.get(
    "/get-all-permissions",
    adminAuthorization(['any']),
    asyncHandler(Permission.getAllPermissions)
);

permission.delete(
    "/:permissionId",
    adminAuthorization(['manage_all']),
    asyncHandler(Permission.delete)
);

export default permission;