import { Request, Response } from "express";
import { AdminPermission as AdminPermissionService } from "../services";
import { AdminPermissionDto } from "../types/dtos";
import { numberValidator } from "../validators";
import { Controller } from ".";

export default class AdminPermission {

    private static readonly service: AdminPermissionService = new AdminPermissionService();

    public static async getAdminPermissionAndPermissionWithAdminId(req: Request, res: Response) {
        const idResult = numberValidator(req.params.adminId);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "Id must be an integer"
            });
            return;
        }

        const serviceResult = await AdminPermission.service.getAdminPermissionAndPermissionWithAdminId(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static paginatePermissions() {
        return Controller.paginate<AdminPermissionService>(AdminPermission.service);
    }

    // public static async createPermission(req: Request, res: Response) {
    //     const permissionData: AdminPermissionDto = req.body;
    //     const permissionExistsResult = await AdminPermission.service.getPermissionWithName(permissionData.name);

    //     if (permissionExistsResult.json.error && permissionExistsResult.statusCode == 500) {
    //         res.status(permissionExistsResult.statusCode).json(permissionExistsResult.json);
    //         return;
    //     }

    //     if (permissionExistsResult.json.data) {
    //         res.status(400).json({
    //             error: false,
    //             message: "Permission already exists"
    //         });
    //         return;
    //     }

    //     const serviceResult = await AdminPermission.service.createAdminPermission(permissionData);
    //     res.status(serviceResult.statusCode).json(serviceResult.json);
    // }

    // public static async delete(req: Request, res: Response) {
    //     const idResult = numberValidator(req.params.roleId);

    //     if (idResult.error) {
    //         res.status(400).send("role id must be an integer");
    //         return;
    //     }

    //     const serviceResult = await Permission.service.delete(idResult.number);
    //     res.status(serviceResult.statusCode).json(serviceResult.json);
    // }

    public static async getAllPermissions(req: Request, res: Response) {
        const serviceResult = await AdminPermission.service.getAllAdminPermissions();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}