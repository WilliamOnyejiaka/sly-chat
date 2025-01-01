import { Request, Response } from "express";
import { Permission as PermissionService } from "../services";
import { PermissionDto } from "../types/dtos";
import { numberValidator } from "../validators";
import {Controller} from ".";

export default class Permission {

    private static readonly service: PermissionService = new PermissionService();

    public static async getPermissionWithId(req: Request, res: Response) {
        const idResult = numberValidator(req.params.permissionId);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "Id must be an integer"
            });
            return;
        }

        const serviceResult = await Permission.service.getItemWithId(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getPermissionWithName(req: Request, res: Response) {
        const roleName = req.params.permissionName;
        const serviceResult = await Permission.service.getItemWithName(roleName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static paginatePermissions() {
        return Controller.paginate<PermissionService>(Permission.service);
    }

    public static async createPermission(req: Request, res: Response) {
        const permissionData: PermissionDto = req.body;
        permissionData.name = permissionData.name.toLowerCase();
        const permissionExistsResult = await Permission.service.getItemWithName(permissionData.name);

        if (permissionExistsResult.json.error && permissionExistsResult.statusCode == 500) {
            res.status(permissionExistsResult.statusCode).json(permissionExistsResult.json);
            return;
        }

        if (permissionExistsResult.json.data) {
            res.status(400).json({
                error: false,
                message: "Permission already exists"
            });
            return;
        }

        const serviceResult = await Permission.service.createPermission(permissionData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const idResult = numberValidator(req.params.permissionId);

        if (idResult.error) {
            res.status(400).send("Permission id must be an integer");
            return;
        }

        const serviceResult = await Permission.service.delete(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllPermissions(req: Request, res: Response) {
        const serviceResult = await Permission.service.getAllPermissions();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}