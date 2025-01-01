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

    public constructor(repo: T, cache: U, protected readonly profilePicRepo: V, protected readonly imageFolderName: string) {
        super(repo);
        this.cache = cache;
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

        const errorResponse = this.handleRepoError(emailExists);
        if (errorResponse) return errorResponse;

        const statusCode = emailExists.data ? HttpStatus.BAD_REQUEST : HttpStatus.OK;
        const error: boolean = !!emailExists.data;

        return this.responseData(statusCode, error, error ? constants("service400Email")! : null);
    }

    public async getUserProfileWithId(userId: number) {
        const repoResult = await this.repo!.getUserProfileWithId(userId);

        const errorResponse = super.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const statusCode = repoResult.data ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        const error: boolean = repoResult.error;
        const user = repoResult.data;

        if (user) {
            this.sanitizeUserImageItems([user]);
            return super.responseData(statusCode, error, constants('200User')!, user);
        }

        return super.responseData(statusCode, error, constants('404User')!, repoResult.data);
    }

    public async getUserProfileWithEmail(email: string) {
        const repoResult = await this.repo!.getUserProfileWithEmail(email);
        const errorResponse = super.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const statusCode = repoResult.data ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        const error: boolean = repoResult.error;
        const user = repoResult.data;

        if (user) {
            this.sanitizeUserImageItems([user]);
            return super.responseData(statusCode, error, constants('200User')!, user);
        }

        return super.responseData(statusCode, error, constants('404User')!, user);
    }

    public async getAllUsers() {
        const repoResult = await this.repo!.getAll();
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        this.sanitizeUserImageItems(repoResult.data);
        return super.responseData(HttpStatus.OK, false, constants('200Users')!, repoResult.data);
    }

    public async paginateUsers(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;  // Calculate the offset
        const take = pageSize;  // Limit the number of records
        const repoResult = await this.repo!.paginate(skip, take);
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const totalRecords = repoResult.data.totalItems;
        const pagination = getPagination(page, pageSize, totalRecords);

        this.sanitizeUserImageItems(repoResult.data.items);

        return super.responseData(HttpStatus.OK, false, constants('200Users')!, {
            data: repoResult.data,
            pagination
        });
    }

    public async uploadProfilePicture(image: Express.Multer.File, userId: number) {
        const repoResult = await this.repo!.getUserProfileWithId(userId);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) {
            if (!(await this.imageService.deleteFiles([image]))) return repoResultError;
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const userProfile = repoResult.data;
        const hasProfilePic = userProfile[this.repo!.imageRelation].length > 0;
        if (hasProfilePic) {
            if (!(await this.imageService.deleteFiles([image]))) return super.responseData(400, true, "This user already has a profile picture");
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const serviceResult = await this.imageService.uploadImage<V>(
            image,
            userId,
            this.profilePicRepo,
            this.imageFolderName
        );
        return serviceResult;
    }

    private async toggleActiveStatus(userId: number, activate: boolean = true) {
        const repoResult = activate ? await this.repo!.updateActiveStatus(userId, true) : await this.repo!.updateActiveStatus(userId, false);
        const errorResponse = this.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;
        //Cache here
        const message = activate ? "Vendor was activated successfully" : "Vendor was deactivated successfully";
        return super.responseData(200, false, message, repoResult.data);
    }

    public async activateUser(userId: number) {
        return await this.toggleActiveStatus(userId);
    }

    public async deActivateUser(userId: number) {
        return await this.toggleActiveStatus(userId, false);
    }

    public async deleteUser(userId: number) {
        const profileRepoResult = await this.repo!.getUserProfileWithId(userId);
        const profileRepoResultError = super.handleRepoError(profileRepoResult);
        if (profileRepoResultError) return profileRepoResultError;

        const userProfile = profileRepoResult.data;
        if (!userProfile) return super.responseData(404, true, "User was not found");

        const profilePictureDetails = userProfile[this.repo!.imageRelation].length > 0 ? userProfile[this.repo!.imageRelation][0] : null;

        if (profilePictureDetails) {
            const cloudinaryResult = await this.imageService.deleteCloudinaryImage(profilePictureDetails.publicId);
            if (cloudinaryResult.statusCode >= 500) {
                return cloudinaryResult;
            }
        }

        const repoResult = await this.repo!.deleteWithId(userId);
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const deleted = await this.cache.delete(String(userId));

        return deleted ?
            super.responseData(200, false, "User was deleted successfully") :
            super.responseData(500, true, http('500')!);
    }

}