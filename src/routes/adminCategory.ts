import { Router, Request, Response } from "express";
import { CategoryManagement } from "../controllers";
import { adminAuthorization, uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";
import { validateQueryParams } from "../validators";
import { createCategory } from "../middlewares/validators/category";

const adminCategory: Router = Router();

adminCategory.get(
    "/paginate-categories",
    adminAuthorization(['any']),
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
    asyncHandler(CategoryManagement.paginateCategories())
);

adminCategory.post(
    "/create-category",
    createCategory,
    asyncHandler(CategoryManagement.createCategory)
);

adminCategory.get(
    "/get-with-name/:categoryName",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithName)
);

adminCategory.get(
    "/get-with-id/:categoryId",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getCategoryWithId)
);

adminCategory.post(
    "/upload-category-image/:categoryId",
    adminAuthorization(['manage_all']),
    uploads.single("image"),
    asyncHandler(CategoryManagement.uploadCategoryImage)
);

adminCategory.get(
    "/",
    adminAuthorization(['any']),
    asyncHandler(CategoryManagement.getAllCategories)
);


adminCategory.delete(
    "/:id",
    adminAuthorization(['manage_all']),
    asyncHandler(CategoryManagement.delete)
);

export default adminCategory;