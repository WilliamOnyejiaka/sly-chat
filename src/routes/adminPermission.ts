import { Router, Request, Response } from "express";
import { AdminPermission } from "../controllers";
import { adminAuthorization, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const adminPermission: Router = Router();

// permission.get(
//     "/paginate-permissions",
//     adminAuthorization(['any']),
//     asyncHandler(Permission.paginatePermissions)
// );

adminPermission.get(
    "/retrieve-admin-permission-with-admin-id/:adminId",
    adminAuthorization(['any']),
    asyncHandler(AdminPermission.getAdminPermissionAndPermissionWithAdminId)
);

// permission.get(
//     "/get-permission-with-name/:roleName",
//     adminAuthorization(['any']),
//     asyncHandler(Permission.getPermissionWithName)
// );

// permission.post(
//     "/create-permission",
//     adminAuthorization(['manage_all']),
//     validateBody([
//         "name",
//         "description"
//     ]),
//     asyncHandler(Permission.createPermission)
// );

// permission.get(
//     "/get-all-permissions",
//     adminAuthorization(['any']),
//     asyncHandler(Permission.getAllPermissions)
// );

// // role.delete(
// //     "/:roleId",
// //     adminAuthorization(['manage_all']),
// //     asyncHandler(Permission.delete)
// // );

export default adminPermission;