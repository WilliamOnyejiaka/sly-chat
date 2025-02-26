import BaseCache from "../../cache/BaseCache";
import { env } from "../../config";
import constants, { http, HttpStatus } from "../../constants";
import ImageRepo from "../../repos/bases/ImageRepo";
import UserRepo from "../../repos/bases/UserRepo";
import { getPagination } from "../../utils";
import ImageService from "../Image";
import BaseService from "./BaseService";

export default class UserService<T extends UserRepo, U extends BaseCache, V extends ImageRepo> extends BaseService<T> {

    protected readonly cache: U;
    protected readonly imageService: ImageService = new ImageService();
    protected readonly storedSalt: string = env("storedSalt")!;

    public constructor(repo: T, cache: U, protected readonly profilePicRepo: V) {
        super(repo);
        this.cache = cache;
    }

    public async createUser(userData: {
        firstName: string,
        lastName: string,
        email: string,
        verified: boolean,
        active: boolean,
        userId: number
    }) {
        const repoResult = await this.repo!.insert(userData);
        const repoResultError = super.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.httpResponseData(201, false, "User has been created successfully", repoResult.data);
    }

    protected sanitizeUserImageItems(items: any[]) {
        items.forEach((item: any) => {
            item.profilePictureUrl = item[this.repo!.imageRelation].length != 0 ? item[this.repo!.imageRelation][0].imageUrl : null;
            delete item[this.repo!.imageRelation];
            delete item.password;
        });
    }

    public async emailExists(email: string) {
        const emailExists = await this.repo!.getUserProfileWithEmail(email);

        const errorResponse = this.httpHandleRepoError(emailExists);
        if (errorResponse) return errorResponse;

        const statusCode = emailExists.data ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
        const error: boolean = !!emailExists.data;

        return this.httpResponseData(statusCode, error, error ? constants("service400Email")! : null);
    }

    public async getUserProfileWithId(userId: number) {
        const repoResult = await this.repo!.getUserProfileWithId(userId);

        const errorResponse = super.httpHandleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const statusCode = repoResult.data ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        const error: boolean = repoResult.error;
        const user = repoResult.data;

        if (user) {
            this.sanitizeUserImageItems([user]);
            return super.httpResponseData(statusCode, error, constants('200User')!, user);
        }

        return super.httpResponseData(statusCode, error, constants('404User')!, repoResult.data);
    }

    public async getUserProfileWithEmail(email: string) {
        const repoResult = await this.repo!.getUserProfileWithEmail(email);
        const errorResponse = super.httpHandleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const statusCode = repoResult.data ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        const error: boolean = repoResult.error;
        const user = repoResult.data;

        if (user) {
            this.sanitizeUserImageItems([user]);
            return super.httpResponseData(statusCode, error, constants('200User')!, user);
        }

        return super.httpResponseData(statusCode, error, constants('404User')!, user);
    }

    public async getAllUsers() {
        const repoResult = await this.repo!.getAllWithFilter();
        const errorResponse = this.httpHandleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        this.sanitizeUserImageItems(repoResult.data);
        return super.httpResponseData(HttpStatus.OK, false, constants('200Users')!, repoResult.data);
    }

    public async paginateUsers(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;  // Calculate the offset
        const take = pageSize;  // Limit the number of records
        const repoResult = await this.repo!.paginate(skip, take);
        const errorResponse = this.httpHandleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const totalRecords = repoResult.data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);

        this.sanitizeUserImageItems(repoResult.data.items);

        return super.httpResponseData(HttpStatus.OK, false, constants('200Users')!, {
            data: repoResult.data,
            pagination
        });
    }

    private async toggleActiveStatus(userId: number, activate: boolean = true) {
        const repoResult = activate ? await this.repo!.updateActiveStatus(userId, true) : await this.repo!.updateActiveStatus(userId, false);
        const errorResponse = this.httpHandleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        //Cache here
        const message = activate ? "Vendor was activated successfully" : "Vendor was deactivated successfully";
        return super.httpResponseData(200, false, message, repoResult.data);
    }

    public async activateUser(userId: number) {
        return await this.toggleActiveStatus(userId);
    }

    public async deActivateUser(userId: number) {
        return await this.toggleActiveStatus(userId, false);
    }

    public async deleteUser(userId: number) {
        const profileRepoResult = await this.repo!.getUserProfileWithId(userId);
        const profileRepoResultError = super.httpHandleRepoError(profileRepoResult);
        if (profileRepoResultError) return profileRepoResultError;

        const userProfile = profileRepoResult.data;
        if (!userProfile) return super.httpResponseData(404, true, "User was not found");

        const profilePictureDetails = userProfile[this.repo!.imageRelation].length > 0 ? userProfile[this.repo!.imageRelation][0] : null;

        if (profilePictureDetails) {
            const cloudinaryResult = await this.imageService.deleteCloudinaryImage(profilePictureDetails.publicId);
            if (cloudinaryResult.statusCode >= 500) {
                return cloudinaryResult;
            }
        }

        const repoResult = await this.repo!.deleteWithId(userId);
        const repoResultError = super.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const deleted = await this.cache.delete(String(userId));

        return deleted ?
            super.httpResponseData(200, false, "User was deleted successfully") :
            super.httpResponseData(500, true, http('500')!);
    }

}