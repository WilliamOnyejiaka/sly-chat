import constants, { http, urls } from "../constants";
import { CommentLike, ProductComment as ProductCommentRepo } from "../repos";
import { CustomerCache } from "../cache";
import BaseService from "./bases/BaseService";
import { ServiceResultDataType, UserType } from "../types/enums";
import { ProductCommentDto, TransactionChat, TransactionMessage } from "../types/dtos";
import { getPagination } from "../utils";

export default class ProductComment extends BaseService<ProductCommentRepo> {

    public commentLikeRepo = new CommentLike();

    public constructor() {
        super(new ProductCommentRepo())
    }

    public async createComment(data: ProductCommentDto) {
        if (data.parentId) {
            const parentExists = await this.repo!.getItemWithId(data.parentId);
            const repoResultError = this.httpHandleRepoError(parentExists);
            if (repoResultError) return repoResultError;
            if (!parentExists.data) return this.httpResponseData(404, true, "Parent comment wa not found");
        }
        return super.create<ProductCommentDto>(data, "Product Comment");
    }

    public async getWithId(id: string, depth: number) {
        const include = this.buildInclude(depth);
        const repoResult = await this.repo!.getWithId(id, include);
        const repoResultError = this.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(200, true, constants('200Comment')!, repoResult.data);
    }

    public async paginateComments(productId: number, page: number, pageSize: number, depth: number): Promise<{ statusCode: number; json: { error: boolean; message: string | null; data: any; }; }> {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.paginate(skip, take, {
            where: {
                productId: productId,
                OR: [
                    { parentId: null },          // Matches explicit null
                    { parentId: { isSet: false } } // Matches missing fields
                ],
            }, include: this.buildInclude(depth)
        }, {
            where: {
                productId: productId,
                OR: [
                    { parentId: null },          // Matches explicit null
                    { parentId: { isSet: false } } // Matches missing fields
                ],
            }
        });
        const repoResultError = this.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data: { items: any, totalItems: any } = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        return super.httpResponseData(200, true, constants('200Comments')!, { data: repoResult.data, pagination });
    }

    public async paginateReplies(productId: number, page: number, pageSize: number, depth: number, parentId: string): Promise<{ statusCode: number; json: { error: boolean; message: string | null; data: any; }; }> {
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const repoResult = await this.repo!.paginate(skip, take, { where: { parentId: parentId, productId: productId }, include: this.buildInclude(depth) }, { where: { parentId: parentId, productId: productId } });
        const repoResultError = this.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data: { items: any, totalItems: any } = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);
        return super.httpResponseData(200, true, constants('200Comments')!, { data: repoResult.data, pagination });
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

    public async like(commentId: string, userId: number, userType: string): Promise<{ statusCode: number; json: { error: boolean; message: string | null; data: any; }; }> {
        const repoResult = await this.repo!.getWithId(commentId, {});
        const repoResultError = this.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        if (repoResult.data) {
            const likeResult = await this.commentLikeRepo.toggleLike(userId, userType, commentId);
            const likeResultError = this.httpHandleRepoError(likeResult);
            if (likeResultError) return likeResultError;
            return this.httpResponseData(200, false, "Action was taken", likeResult.data);
        }
        return this.httpResponseData(404, true, "Comment was not found");
    }
}