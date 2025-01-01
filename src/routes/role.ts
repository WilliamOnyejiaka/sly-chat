import { Router, Request, Response } from "express";
import { Role } from "../controllers";
import { adminAuthorization, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const role: Router = Router();

role.get(
    "/paginate-roles",
    adminAuthorization(['any']),
    asyncHandler(Role.paginateRoles)
);

role.get(
    "/get-role-with-id/:roleId",
    adminAuthorization(['any']),
    asyncHandler(Role.getRoleWithId)
);

role.get(
    "/get-role-with-name/:roleName",
    adminAuthorization(['any']),
    asyncHandler(Role.getRoleWithName)
);

role.post(
    "/create-role",
    adminAuthorization(['manage_all']),
    validateBody([
        "name",
        "description",
        "level"
    ]),
    asyncHandler(Role.createRole)
);

role.get(
    "/get-all-roles",
    adminAuthorization(['any']),
    asyncHandler(Role.getAllRoles)
);

role.delete(
    "/:roleId",
    adminAuthorization(['manage_all']),
    asyncHandler(Role.delete)
);

export default role;