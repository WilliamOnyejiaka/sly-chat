import { Router, Request, Response } from "express";
import { Seed } from "../controllers";
import { bannerUploads, uploads, validateBody } from "../middlewares";import asyncHandler from "express-async-handler";

const seed: Router = Router();

seed.get("/default-roles", asyncHandler(Seed.defaultRoles));
seed.get("/default-permissions", asyncHandler(Seed.defaultPermissions));


export default seed;