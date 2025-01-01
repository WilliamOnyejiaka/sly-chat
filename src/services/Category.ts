import constants, { http } from "../constants";
import { Category as CategoryRepo } from "../repos";
import { CategoryDto } from "../types/dtos";
import AssetService from "./bases/AssetService";
import CategoryImage from "../repos/CategoryImage";

export default class Category extends AssetService<CategoryRepo, CategoryImage> {

    public constructor() {
        super(new CategoryRepo(), new CategoryImage(), 'category');
    }

    public async createCategory(categoryData: CategoryDto) {
        return await super.create<CategoryDto>(categoryData, "Category");
    }

    private sanitizeServiceResult(serviceResult: any, admin: boolean, fieldsToRemove: string[] = ['adminId']) {
        if (!admin && serviceResult.json?.data) {
            // Handle both single objects and arrays of data
            const data = Array.isArray(serviceResult.json.data)
                ? serviceResult.json.data
                : [serviceResult.json.data];

            this.sanitizeData(data, fieldsToRemove);
        }
        return serviceResult;
    }


    public async getCategory(identifier: string | number, admin: boolean = false) {
        const serviceResult = await super.getItemAndImage(identifier);
        if (admin) return serviceResult;

        if (serviceResult.json.data) {
            this.sanitizeData([serviceResult.json.data], ['adminId']);
        }

        return serviceResult;
    }

    public async getAllCategories(admin: boolean = false) {
        const serviceResult = await super.getAllItems(constants('200Categories')!);
        if (admin) return serviceResult;

        if (serviceResult.json.data) {
            this.sanitizeData(serviceResult.json.data, ['adminId']);
        }

        return serviceResult;
        // return await super.getAllItems(constants('200Categories')!);
    }

    public async update(categoryId: number, updateData: any) {

    }
}