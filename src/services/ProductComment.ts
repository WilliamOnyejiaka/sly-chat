import constants, { http, urls } from "../constants";
import { ProductComment as ProductCommentRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";
import { ProductCommentDto, TransactionChat, TransactionMessage } from "../types/dtos";
import { UploadedFiles } from "../types";

export default class ProductComment extends BaseService<ProductCommentRepo> {

    public constructor() {
        super(new ProductCommentRepo())
    }

    public async createComment(data: ProductCommentDto){
        if(data.parentId){
            const parentExists = await this.repo!.getItemWithId(data.parentId);
            const repoResultError = this.httpHandleRepoError(parentExists);
            if(repoResultError) return repoResultError;
            if(!parentExists.data) return this.httpResponseData(404,true,"Parent comment wa not found");
        }
        return super.create<ProductCommentDto>(data,"Product Comment");
    }

    public async getWithId(id: string,depth: number){
        const include = this.buildInclude(depth);
        const repoResult = await this.repo!.getWithId(id,include);
        const repoResultError = this.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(200,true,constants('200Comment')!,repoResult.data);
    }

    public async paginateComments(page: number, pageSize: number,depth: number): Promise<{ statusCode: number; json: { error: boolean; message: string | null; data: any; }; }> {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.paginate(skip,take,{ where: {parent: null},include: this.buildInclude(depth)});
        const repoResultError = this.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(200, true, constants('200Comments')!, repoResult.data); 
    }

    private buildInclude(depth: number) {
        let include: any = {};
        let current = include;
        for (let i = 0; i < depth; i++) {
            current.replies = { include: {} };
            current = current.replies.include;
        }
        return include;
    }
}