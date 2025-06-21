import BaseService from "./../bases/BaseService";
import UserRepo from "../../repos/bases/UserRepo";
import { UserDto } from "../../types/dtos";
import { ServiceResultDataType } from "../../types/enums";

export default class UserService<T extends UserRepo> extends BaseService<T> {

    public constructor(repo: T) {
        super(repo);
    }

    public async createUser(newUser: UserDto) {
        const repoResult = await this.repo!.insert(newUser);
        const repoResultError = super.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(201, false, "User has been created successfully", repoResult.data);
    }

    public async updateLastSeen(userId: number) {
        const repoResult = await this.repo!.updateLastSeen(userId);
        const repoResultError = super.handleRepoError(ServiceResultDataType.SOCKET, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(ServiceResultDataType.SOCKET, 200, false, "User has been updated successfully", repoResult.data);
    }

    public async getLastSeen(userId: number) {
        const repoResult = await this.repo!.findLastSeen(userId);
        console.log(repoResult);
        const repoResultError = super.handleRepoError(ServiceResultDataType.SOCKET, repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(ServiceResultDataType.SOCKET, 200, false, null, repoResult.data);
    }


    // public async uploadProfilePic(userId: number, userType: string, profilePictureUrl: string) {
    //     const repoResult = await this.repo!.updateProfilePic(userId, userType, profilePictureUrl);
    //     const repoResultError = super.socketHandleRepoError(repoResult);
    //     if (repoResultError) return repoResultError;
    //     return super.socketResponseData(201, false, "User has been created successfully", repoResult.data);
    // }
}