import prisma from ".";
import Repo from "./bases/Repo";

export default class ProductComment extends Repo {

    public constructor() {
        super('productComment');
    }

    public async getParentComment(parentId: string){
        return this.getItem({parentId})
    }

    public async getWithId(id: string,include: Object){
        return this.getItem({id: id},{include: include});
    }
}