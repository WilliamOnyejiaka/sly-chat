import { Request, Response } from "express";
import { Seed as SeedService } from "./../services";

export default class Seed {

    private static readonly service: SeedService = new SeedService();

    public static async defaultRoles(req: Request, res: Response) {
        const serviceResult = await Seed.service.defaultRoles();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async defaultPermissions(req: Request, res: Response) {
        const serviceResult = await Seed.service.defaultPermissions();
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async defaultRolePermissions(req: Request, res: Response) {

    }

}