import { Request, Response, NextFunction } from "express";
import { Admin } from "../services";
import { http } from "../constants";

const adminAuthorization = (requiredPermissions: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    const active = res.locals.data.active;
    if (!active) {
        res.status(401).json({
            error: true,
            message: http('401')!
        });
        return;
    }

    const adminId = res.locals.data.id;
    const admin = await (new Admin()).getAdminAndRole(adminId);

    if (!admin) {
        res.status(403).json({
            error: true,
            message: "Admin not found"
        });
        return;
    }


    const rolePermissions = admin.json.data.role.RolePermission;
    const directPermissions = admin.json.data.directPermissions;

    const rolePermissionsNames = rolePermissions.map((rp: any) => rp.permission.name);
    const directPermissionsNames = directPermissions.map((rp: any) => rp.permission.name);

    const allPermissions = new Set([...rolePermissionsNames, ...directPermissionsNames]);
    const hasPermission = requiredPermissions.includes("any") ? true : requiredPermissions.some((perm) => allPermissions.has(perm));

    if (!hasPermission) {
        res.status(403).json({
            error: true,
            message: "Access denied"
        });
        return;
    }

    next();
};

export default adminAuthorization;