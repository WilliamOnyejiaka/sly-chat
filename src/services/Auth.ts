import { Token } from ".";
import { AdminCache, CustomerCache, VendorCache } from "../cache";
import BaseCache from "../cache/BaseCache";
import constants, { http, HttpStatus } from "../constants";
import { Admin, Customer, Vendor } from "../repos";
import UserRepo from "../repos/bases/UserRepo";
import { UserType } from "../types/enums";
import { Password } from "../utils";
import Authentication from "./bases/Authentication";

export default class Auth extends Authentication {

    public constructor() {
        super();
    }

    public async login<T extends UserRepo, U extends BaseCache>(
        repo: T,
        logInDetails: {
            email: string,
            password: string
        },
        cache: U,
        role: UserType
    ) {
        const repoResult = role === "admin" ? await this.adminRepo.getAdminAndRoleWithEmail(logInDetails.email) : await repo.getUserProfileWithEmail(logInDetails.email);
        const errorResponse = super.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const user = repoResult.data;

        if (user) {
            const hashedPassword = user.password
            const validPassword = Password.compare(logInDetails.password, hashedPassword, this.storedSalt);

            if (validPassword) {
                user.profilePictureUrl = user[repo.imageRelation].length != 0 ? user[repo.imageRelation][0].imageUrl : null;
                delete user[repo.imageRelation];
                delete user.password;
                const cacheSuccessful = await cache.set(
                    String(user.id),
                    user
                );

                const token = role === "admin" ? this.generateAdminToken(user) : this.generateUserToken(user.id, role);

                return cacheSuccessful ? super.responseData(200, false, "Login was successful", {
                    token: token,
                    user: user
                }) : super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
            }
            return super.responseData(HttpStatus.BAD_REQUEST, true, "Invalid password");
        }
        return super.responseData(HttpStatus.NOT_FOUND, true, constants("404User")!);
    }

    public async customerLogin(email: string, password: string) {
        return await this.login<Customer, CustomerCache>(this.customerRepo, { email, password }, this.customerCache, UserType.Customer);
    }

    public async adminLogin(email: string, password: string) {
        return await this.login<Admin, AdminCache>(this.adminRepo, { email, password }, this.adminCache, UserType.Admin);
    }

    public async vendorLogin(email: string, password: string) {
        return await this.login<Vendor, VendorCache>(this.vendorRepo, { email, password }, this.vendorCache, UserType.Vendor);
    }

    public async logOut(token: string) {
        const tokenValidationResult: any = Token.validateToken(token, ["any"], this.tokenSecret);

        if (tokenValidationResult.error) {
            return super.responseData(400, true, tokenValidationResult.message);
        }

        const decoded = Token.decodeToken(token);
        const blacklisted = await this.tokenBlackListCache.set(token, { data: decoded.data, types: decoded.types }, decoded.expiresAt);

        return blacklisted ?
            super.responseData(200, false, "User has been logged out successfully") :
            super.responseData(500, true, http('500')!);
    }

    public async requestPasswordOTP() {

    }

    public async resetPassword() {

    }
}