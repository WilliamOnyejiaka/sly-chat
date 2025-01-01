import constants, { http, HttpStatus, urls } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import { VendorCache } from "../cache";
import UserService from "./bases/UserService";
import { Password } from "../utils";
import VendorDto from "../types/dtos";

export default class Vendor extends UserService<VendorRepo, VendorCache, VendorProfilePicture> {

    public constructor() {
        super(new VendorRepo(), new VendorCache(), new VendorProfilePicture(), 'vendorProfilePic');
    }

    public async createVendor(vendorDto: VendorDto) {
        const passwordHash: string = Password.hashPassword(vendorDto.password!, this.storedSalt);
        vendorDto.password = passwordHash;

        const repoResult = await this.repo!.insert(vendorDto);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const vendor = repoResult.data!;
        delete vendor.password;
        return super.responseData(201, false, "Vendor has been created successfully");
    }

    public async updateFirstName(id: number, firstName: string) {
        const repoResult = await this.repo!.updateFirstName(id, firstName);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateLastName(id: number, lastName: string) {
        const repoResult = await this.repo!.updateLastName(id, lastName);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    public async updateEmail(id: number, email: string) {
        const emailExists = await this.repo!.getUserProfileWithEmail(email);
        if (emailExists.error) {
            return super.responseData(500, true, http("500") as string);
        }

        if (emailExists.data) {
            return super.responseData(400, true, "Email already exists.");
        }

        const repoResult = await this.repo!.updateEmail(id, email);
        if (repoResult.error) {
            return super.responseData(repoResult.type, true, repoResult.message as string);
        }

        const statusCode = !repoResult.error ? 200 : 500;
        const message = repoResult.error ? http("500")! : constants('updatedVendor')!;

        return super.responseData(statusCode, repoResult.error, message);
    }

    // public async delete(vendorId: number) {
    //     const repoResult = await this.repo!.deleteWithId(vendorId); // ! TODO: add cloudinary image delete
    //     const errorResponse = this.handleRepoError(repoResult);
    //     if (errorResponse) return errorResponse;

    //     const deleted = await this.cache.delete(String(vendorId));

    //     return deleted ?
    //         super.responseData(200, false, "Vendor was deleted successfully") :
    //         super.responseData(500, true, http('500')!);
    // }

}

