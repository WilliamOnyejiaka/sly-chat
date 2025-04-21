import BaseService from "./bases/BaseService";
import { StoreFollower, Store as StoreRepo } from "../repos";
import { StoreDto, UserDto } from "../types/dtos";

export default class Store extends BaseService<StoreRepo> {

    private readonly storeFollowerRepo = new StoreFollower();

    public constructor() {
        super(new StoreRepo());
    }

    public async createStore(newStore: StoreDto) {
        const repoResult = await this.repo!.insert(newStore);
        const repoResultError = super.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(201, false, "Store has been created successfully", repoResult.data);
    }

    // public async uploadProfilePic(userId: number, userType: string, profilePictureUrl: string) {
    //     const repoResult = await this.repo!.updateProfilePic(userId, userType, profilePictureUrl);
    //     const repoResultError = super.socketHandleRepoError(repoResult);
    //     if (repoResultError) return repoResultError;
    //     return super.socketResponseData(201, false, "User has been created successfully", repoResult.data);
    // }

    public async upload(storeId: number, storeLogoUrl: string) {
        const repoResult = await this.repo!.updateStoreLogo(storeId, storeLogoUrl);
        const repoResultError = super.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(200, false, "Store has been deleted successfully", repoResult.data);
    }

    public async delete(vendorId: number) {
        const repoResult = await this.repo!.delete({ vendorId });
        const repoResultError = super.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(200, false, "Store has been deleted successfully", repoResult.data);
    }

    public async follow(storeId: number, customerId: number, action: "follow" | "unfollow") {
        if (action == "follow") {
            const repoResult = await this.storeFollowerRepo.follow(customerId, storeId);
            const repoResultError = super.httpHandleRepoError(repoResult);
            if (repoResultError) return repoResultError;
            return super.httpResponseData(200, false, "Store has been followed successfully", repoResult.data);
        } else {
            const repoResult = await this.storeFollowerRepo.unfollow(customerId, storeId);
            const repoResultError = super.httpHandleRepoError(repoResult);
            if (repoResultError) return repoResultError;
            return super.httpResponseData(200, false, "Store has been unfollowed successfully", repoResult.data);
        }
    }
}