import { Request, Response } from "express";
import { CategoryDto } from "../types/dtos";
import { Controller } from ".";
import Category from "./Category";
import { CategoryType } from "../types/enums";
import { validationResult } from "express-validator";
import { http, HttpStatus } from "../constants";

export default class CategoryManagement extends Category {

    public static async createCategory(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const adminId = res.locals.data.id;
        const categoryData: CategoryDto = {
            ...req.body,
            adminId: adminId
        };

        const serviceResult = await CategoryManagement.facade.createCategory(categoryData, CategoryType.Main);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

    public static async createCategoryAll(req: Request, res: Response) {

    }

    public static override async getCategoryWithName(req: Request, res: Response) {
        const serviceResult = await Category.facade.adminGetCategory(req.params.categoryName, CategoryType.Main);
        Controller.response(res, serviceResult);
    }

    public static override async getAllCategories(req: Request, res: Response) {
        const serviceResult = await Category.facade.adminGetCategories(CategoryType.Main);
        Controller.response(res, serviceResult);
    }

    public static async uploadCategoryImage(req: Request, res: Response) {
        const image = req.file!;
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            if (!(await Controller.deleteFiles([image]))) {
                Controller.handleValidationErrors(res, validationErrors);
                return;
            }
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: true,
                message: http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!,
                data: {}
            });
            return;
        }

        const categoryId = Number(req.params.categoryId);
        const serviceResult = await Category.facade.uploadImage(image, categoryId, CategoryType.Main);
        Controller.response(res, serviceResult);
    }

    public static async delete(req: Request, res: Response) {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            Controller.handleValidationErrors(res, validationErrors);
            return;
        }

        const categoryId = Number(req.params.id)
        const serviceResult = await Category.facade.deleteCategory(categoryId, CategoryType.Main);
        res.status(serviceResult.statusCode).json(serviceResult.json);
    }

}