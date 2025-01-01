import { Router, Request, Response } from "express";
import { Admin } from "../controllers";
import { adminAuthorization, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { bodyNumberIsValid, emailIsValid, paramNumberIsValid, passwordIsValid, phoneNumberIsValid, userEmailExists } from "../middlewares/validators/validators";
import { Admin as AdminRepo } from "../repos";

const admin: Router = Router();

admin.post(
    "/upload-profile-pic",
    uploads.single("image"),
    asyncHandler(Admin.uploadProfilePicture)
);

admin.get(
    "/generate-sign-up-key/:roleId",
    adminAuthorization(['manage_all']),
    [paramNumberIsValid('roleId')],
    asyncHandler(Admin.generateSignUpKey)
);

admin.get("/get-admin-and-role", asyncHandler(Admin.getAdminAndRole));

admin.post(
    "/create-admin",
    adminAuthorization(['manage_all']),
    validateBody([
        "firstName",
        "password",
        "lastName",
        "email",
        "phoneNumber",
        "roleId",
        "active"
    ]),
    [
        emailIsValid,
        passwordIsValid,
        phoneNumberIsValid,
        userEmailExists<AdminRepo>(new AdminRepo())
    ],
    asyncHandler(Admin.createAdmin)
);

// admin.patch(
//     "/deactivate-admin",
//     adminAuthorization(['manage_all']),
//     validateBody(['adminId']),
//     [bodyNumberIsValid('adminId')],
//     asyncHandler(Admin.deactivateAdmin())
// );

// admin.patch(
//     "/activate-admin",
//     adminAuthorization(['manage_all']),
//     validateBody(['adminId']),
//     [bodyNumberIsValid('adminId')],
//     asyncHandler(Admin.activateAdmin())
// );

admin.patch(
    "/assign-role",
    adminAuthorization(['manage_all']),
    validateBody(['adminId', 'roleId']),
    [bodyNumberIsValid('adminId'), bodyNumberIsValid('roleId')],
    asyncHandler(Admin.assignRole)
);

admin.delete(
    "/:adminId",
    adminAuthorization(['manage_all']),
    [paramNumberIsValid('adminId')],
    asyncHandler(Admin.deleteAdmin)
);

admin.get(
    "/",
    asyncHandler(Admin.getAdmin)
);

admin.delete(
    "/",
    asyncHandler(Admin.delete)
);



export default admin;