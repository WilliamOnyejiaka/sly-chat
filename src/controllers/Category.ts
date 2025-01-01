import { Request, Response } from "express";
import { numberValidator } from "../validators";
import { Controller } from ".";
import { CategoryManagementFacade } from "../facade";
import { CategoryType } from "../types/enums";
import BaseService from "../services/bases/BaseService";

export default abstract class Category {

    protected static readonly facade: CategoryManagementFacade = new CategoryManagementFacade();

    public static paginateCategories() {
        return Controller.paginate<BaseService>(Category.facade.getCategoryService(CategoryType.Main));
    }

    public static async getAllCategories(req: Request, res: Response) {
        const serviceResult = await Category.facade.getAllCategories(CategoryType.Main);
        Controller.response(res,serviceResult);
    }

    public static async getCategoryWithName(req: Request, res: Response) {
        const serviceResult = await Category.facade.getCategory(req.params.categoryName,CategoryType.Main);
        Controller.response(res, serviceResult);
    }

    public static async getCategoryWithId(req: Request, res: Response) {        
        const idResult = numberValidator(req.params.categoryId);

        if (idResult.error) {
            res.status(400).send("Category id must be an integer");
            return;
        }

        const serviceResult = await Category.facade.getCategory(idResult.number,CategoryType.Main);
        Controller.response(res, serviceResult);
    }
}