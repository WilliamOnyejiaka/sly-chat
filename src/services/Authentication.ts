import { OTP, Token, Admin as AdminService } from ".";
import { Admin, Vendor, Customer } from "../repos";
import { CipherUtility, parseJson, Password } from "../utils";
import { env, logger } from "../config";
import VendorDto, { AdminDto, CustomerAddressDto, CustomerDto } from "../types/dtos";
import constants, { http, HttpStatus } from "../constants";
import { AdminCache, AdminKey, CustomerCache, TokenBlackList, VendorCache } from "../cache";
import BaseService from "./bases/BaseService";
import UserRepo from "../repos/bases/UserRepo";
import BaseCache from "../cache/BaseCache";


export default class Authentication extends BaseService { // ! TODO: Deprecated class remove

    private readonly storedSalt: string = env("storedSalt")!;
    private readonly tokenSecret: string = env('tokenSecret')!;
    private readonly secretKey: string = env('secretKey')!;
    private readonly vendorRepo: Vendor = new Vendor();
    private readonly vendorCache: VendorCache = new VendorCache();
    private readonly customerCache: CustomerCache = new CustomerCache();
    private readonly adminRepo: Admin = new Admin();
    private readonly customerRepo: Customer = new Customer();
    private readonly tokenBlackListCache: TokenBlackList = new TokenBlackList();
    private readonly adminCache: AdminCache = new AdminCache();

    public constructor() {
        super();
    }

    private generateToken(data: any, role: string) {
        return Token.createToken(this.tokenSecret, data, [role]);
    }

    private generateUserToken(userId: number, role: string) {
        return this.generateToken({ id: userId }, role);
    }

    private generateAdminToken(admin: any) {
        return this.generateToken(admin, "admin");
    }

    public async vendorSignUp(vendorDto: VendorDto) {
        const passwordHash: string = Password.hashPassword(vendorDto.password!, this.storedSalt);
        vendorDto.password = passwordHash;

        const repoResult = await this.vendorRepo.insert(vendorDto);
        const error: boolean = repoResult.error
        const statusCode = repoResult.type;
        const message: string = !error ? "Vendor has been created successfully" : repoResult.message!;

        if (!error) {
            const result = repoResult.data!;
            delete (result as VendorDto).password;
            const cacheSuccessful = await this.vendorCache.set(
                String((result as VendorDto).id),
                result as VendorDto
            );
            return cacheSuccessful ? super.responseData(statusCode, error, message, {
                token: Token.createToken(env('tokenSecret')!, { id: result.id }, ["vendor"]),
                vendor: result
            }) : super.responseData(statusCode, error, message);
        }
        return super.responseData(statusCode, error, message);
    }

    public async login<T extends UserRepo, U extends BaseCache>(
        repo: T,
        logInDetails: {
            email: string,
            password: string
        },
        cache: U,
        role: string
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

    public async customerSignUp(
        customerData: {
            firstName: string,
            lastName: string,
            password: string,
            email: string,
            phoneNumber: string
        }, addressData: CustomerAddressDto) {

        const passwordHash: string = Password.hashPassword(customerData.password, this.storedSalt);
        customerData.password = passwordHash;

        const repoResult = await this.customerRepo.insert({ customerData, addressData });
        const error: boolean = repoResult.error;
        const statusCode = repoResult.type;
        const message: string = !error ? "Customer has been created successfully" : repoResult.message!;
        const result = repoResult.data;


        if (!error) {
            delete result.password;
            const cacheSuccessful = await this.customerCache.set(
                String(result.id),
                result
            );

            return cacheSuccessful ? super.responseData(statusCode, error, message, {
                token: Token.createToken(env('tokenSecret')!, { id: result.id }, ["customer"]),
                customer: result
            }) : super.responseData(statusCode, error, message);
        }
        return super.responseData(statusCode, error, message, result);
    }

    public async customerLogin(email: string, password: string) {
        return await this.login<Customer, CustomerCache>(this.customerRepo, { email, password }, this.customerCache, "customer");
    }

    public async adminLogin(email: string, password: string) {
        return await this.login<Admin, AdminCache>(this.adminRepo, { email, password }, this.adminCache, "admin");
    }

    public async vendorLogin(email: string, password: string) {
        return await this.login<Vendor, VendorCache>(this.vendorRepo, { email, password }, this.vendorCache, "vendor");
    }

    public async vendorEmailOTP(email: string) {
        const repoResult = await this.vendorRepo.getUserProfileWithEmail(email);

        if (repoResult.error) {
            return super.responseData(500, true, http("500")!);
        }

        const vendor = repoResult.data;

        if (vendor) {
            const vendorName = (vendor as VendorDto).firstName + " " + (vendor as VendorDto).lastName;
            const otpService = new OTP((vendor as VendorDto).email, "vendor", { name: vendorName });
            const otpServiceResult = await otpService.send();
            return super.responseData(otpServiceResult.statusCode, otpServiceResult.json.error, otpServiceResult.json.message);
        }

        return super.responseData(404, true, constants("404Vendor")!);
    }


    public async vendorEmailVerification(vendorEmail: string, otpCode: string) {
        const otp = new OTP(vendorEmail, "vendor");
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) {
            return otpServiceResult;
        }

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const updated = await this.vendorRepo.updateVerifiedStatus(vendorEmail);

        if (updated.error) {
            return super.responseData(500, true, http("500")!);
        }

        if (otpServiceResult.json.error) {
            return otpServiceResult;
        }

        const repoResult = await this.vendorRepo.getUserProfileWithEmail(vendorEmail);

        if (repoResult.error) {
            return super.responseData(500, true, http("500")!);
        }

        const vendor: VendorDto = (repoResult.data as VendorDto);

        if (vendor) {
            delete vendor.password;
            const cacheSuccessful = await this.vendorCache.set(
                vendor.email,
                vendor
            );

            return cacheSuccessful ? super.responseData(200, false, otpServiceResult.json.message, {
                token: Token.createToken(env('tokenSecret')!, vendor, ["vendor"]),
                vendor: vendor
            }) : super.responseData(500, true, http('500')!);
        }
        return super.responseData(404, true, constants("404Vendor")!);
    }

    public async logoOut(token: string) {
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

    public async adminSignUp(signUpData: {
        firstName: string,
        lastName: string,
        email: string,
        active: boolean,
        phoneNumber: string,
        key?: string,
        roleId?: number
    }) {
        const keyCache = new AdminKey();
        const cacheResult = await keyCache.get(signUpData.key!);

        if (cacheResult.error) {
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        if (!cacheResult.data) {
            return super.responseData(HttpStatus.NOT_FOUND, true, "Key not found");
        }

        const decryptResult = CipherUtility.decrypt(signUpData.key!, this.secretKey);
        if (decryptResult.error) {
            return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
        }

        const decodedJson = parseJson(decryptResult.originalText!);
        if (decodedJson.error) {
            return super.responseData(HttpStatus.BAD_REQUEST, true, decodedJson.message);
        }

        const keyDetails = decodedJson.data;
        delete signUpData.key;
        signUpData.roleId = keyDetails.roleId;

        const serviceResult = await (new AdminService()).createAdmin(signUpData as any, keyDetails.createdBy);
        return serviceResult;
    }

    // public async getToken(user: any,types: string[]){
    //     const token = Token.createToken(env('tokenSecret')!, admin, ["admin"]);
    //     return 
    // }
}