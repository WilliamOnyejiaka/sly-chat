import { Request, Response } from "express";
import { Role as RoleService } from "../services";
import { RoleDto } from "../types/dtos";
import { numberValidator } from "../validators";

export default class Role {

    private static readonly service: RoleService = new RoleService();

    public static async getRoleWithId(req: Request, res: Response) {
        const idResult = numberValidator(req.params.roleId);

        if (idResult.error) {
            res.status(400).json({
                error: true,
                message: "Id must be an integer"
            });
            return;
        }

        const serviceResult = await Role.service.getRoleWithId(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getRoleWithName(req: Request, res: Response) {
        const roleName = req.params.roleName;
        const serviceResult = await Role.service.getRoleWithName(roleName);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }


    public static async paginateRoles(req: Request, res: Response) {
        const pageResult = numberValidator(req.query.page);
        if (pageResult.error) {
            res.status(400).json({
                error: true,
                message: "page must be an integer"
            });
            return;
        }

        const pageSizeResult = numberValidator(req.query.pageSize);
        if (pageSizeResult.error) {
            res.status(400).json({
                error: true,
                message: "pageSize must be an integer"
            });
            return;
        }

        const page = pageResult.number;
        const pageSize = pageSizeResult.number;

        const serviceResult = await Role.service.paginateRoles(page, pageSize);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createRole(req: Request, res: Response) {

        const levelResult = numberValidator(req.body.level);
        if (levelResult.error) {
            res.status(400).json({
                error: true,
                message: "level must be an integer"
            });
            return;
        }

        req.body.level = levelResult.number;
        const roleData: RoleDto = req.body;
        roleData.name = roleData.name.toUpperCase();

        const roleExistsResult = await Role.service.getRoleWithName(roleData.name);
        if (roleExistsResult.json.error && roleExistsResult.statusCode == 500) {
            res.status(roleExistsResult.statusCode).json(roleExistsResult.json);
            return;
        }

        if (roleExistsResult.json.data) {
            res.status(400).json({
                error: false,
                message: "Role already exists"
            });
            return;
        }

        const serviceResult = await Role.service.createRole(roleData);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async delete(req: Request, res: Response) {
        const idResult = numberValidator(req.params.roleId);

        if (idResult.error) {
            res.status(400).send("role id must be an integer");
            return;
        }

        const serviceResult = await Role.service.delete(idResult.number);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async getAllRoles(req: Request, res: Response) {
        const serviceResult = await Role.service.getAllRoles();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}