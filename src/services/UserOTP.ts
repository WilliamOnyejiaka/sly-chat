import { OTP } from ".";
import { AdminCache, CustomerCache, VendorCache } from "../cache";
import BaseCache from "../cache/BaseCache";
import constants, { http } from "../constants";
import { Admin, Customer, Vendor } from "../repos";
import UserRepo from "../repos/bases/UserRepo";
import Authentication from "./bases/Authentication";

export default class UserOTP extends Authentication {

    public constructor() {
        super();
    }

    public async sendUserOTP<T extends UserRepo>(repo: T, email: string, user: string) {
        const repoResult = await repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            const userName = userProfile.firstName + " " + userProfile.lastName;
            const otpService = new OTP(userProfile.email, user, { name: userName });
            const otpServiceResult = await otpService.send();
            return otpServiceResult
        }

        return super.responseData(404, true, constants('404User')!);
    }

    public async sendVendorOTP(email: string) {
        return await this.sendUserOTP<Vendor>(this.vendorRepo, email, "vendor");
    }

    public async sendCustomerOTP(email: string) {
        return await this.sendUserOTP<Customer>(this.customerRepo, email, "customer");
    }

    public async sendAdminOTP(email: string) {
        return await this.sendUserOTP<Admin>(this.adminRepo, email, "admin");
    }

    private async emailVerification<T extends UserRepo, U extends BaseCache>(repo: T, cache: U, email: string, otpCode: string, user: string) {
        const otp = new OTP(email, user);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) return otpServiceResult;

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const updatedResult = await repo.updateVerifiedStatus(email);
        const updatedResultError = this.handleRepoError(updatedResult);
        if (updatedResultError) return updatedResultError;

        const repoResult = user === "admin" ? await this.adminRepo.getAdminAndRoleWithEmail(email) : await repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            this.setUserProfilePicture<T>(userProfile, repo);
            delete userProfile.password;
            delete userProfile[repo.imageRelation];

            const cacheSuccessful = await cache.set(
                userProfile.id,
                userProfile
            );

            return cacheSuccessful ? super.responseData(200, false, otpServiceResult.json.message, {
                token: user === "admin" ? this.generateAdminToken(userProfile) : this.generateUserToken(userProfile.id, user),
                vendor: userProfile
            }) : super.responseData(500, true, http('500')!);
        }
        return super.responseData(404, true, constants('404User')!);
    }

    public async vendorEmailVerification(email: string, otpCode: string) {
        return await this.emailVerification<Vendor, VendorCache>(
            this.vendorRepo,
            this.vendorCache,
            email,
            otpCode,
            "vendor"
        );
    }

    public async customerEmailVerification(email: string, otpCode: string) {
        return await this.emailVerification<Customer, CustomerCache>(
            this.customerRepo,
            this.customerCache,
            email,
            otpCode,
            "customer"
        );
    }

    public async adminEmailVerification(email: string, otpCode: string) {
        return await this.emailVerification<Admin, AdminCache>(
            this.adminRepo,
            this.adminCache,
            email,
            otpCode,
            "admin"
        );
    }

} 