import { AdminCache, AdminKey, CustomerCache, VendorCache } from "../cache";
import { env } from "../config";
import { http, HttpStatus } from "../constants";
import VendorDto, { CustomerAddressDto } from "../types/dtos";
import { CipherUtility, parseJson, Password } from "../utils";
import { Admin as AdminService, Token } from ".";
import Authentication from "./bases/Authentication";

export default class UserRegistration extends Authentication {

    public constructor() {
        super();
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

    public async adminSignUp(signUpData: { // TODO: cache admin after registration
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

}