import { Router, Request, Response } from "express";
import { Category } from "../controllers";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";

const category: Router = Router();

category.get(
    "/paginate-categories",
    validateQueryParams([
        {
            name: "page",
            type: "number"
        },
        {
            name: "pageSize",
            type: "number"
        }
    ]),
    asyncHandler(Category.paginateCategories())
);

category.get(
    "/get-with-name/:categoryName",
    asyncHandler(Category.getCategoryWithName)
);

category.get(
    "/get-with-id/:categoryId",
    asyncHandler(Category.getCategoryWithId)
);

category.get(
    "/",
    asyncHandler(Category.getAllCategories)
);


export default category;