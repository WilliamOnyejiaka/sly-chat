import prisma from ".";
import { CategoryDto } from "../types/dtos";
import AssetRepo from "./bases/AssetRepo";


export default class SubCategory extends AssetRepo {

    public constructor() {
        super('subCategory','SubCategoryImage');
    }

    public async insertSubCategory(data: any) {
        return await super.insert(data)
    }

    public async getCategoryWithId(id: number) {
        return await super.getItemWithId(id);
    }

    public async getCategoryWithName(name: string) {
        return await super.getItem({ name: name });
    }

    public async updateCategory(id: number, updateData: any) {
        return await super.update({ id: id }, updateData);
    }
}
