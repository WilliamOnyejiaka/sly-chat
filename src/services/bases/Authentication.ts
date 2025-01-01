import { AdminCache, CustomerCache, TokenBlackList, VendorCache } from "../../cache";
import { env } from "../../config";
import { Admin, Customer, Vendor } from "../../repos";
import UserRepo from "../../repos/bases/UserRepo";
import { Password } from "../../utils";
import Token from "../Token";
import BaseService from "./BaseService";

export default class Authentication extends BaseService {

    protected readonly storedSalt: string = env("storedSalt")!;
    protected readonly tokenSecret: string = env('tokenSecret')!;
    protected readonly secretKey: string = env('secretKey')!;
    protected readonly vendorRepo: Vendor = new Vendor();
    protected readonly vendorCache: VendorCache = new VendorCache();
    protected readonly customerCache: CustomerCache = new CustomerCache();
    protected readonly adminRepo: Admin = new Admin();
    protected readonly customerRepo: Customer = new Customer();
    protected readonly tokenBlackListCache: TokenBlackList = new TokenBlackList();
    protected readonly adminCache: AdminCache = new AdminCache();

    public constructor() {
        super();
    }

    private generateToken(data: any, role: string) {
        return Token.createToken(this.tokenSecret, data, [role]);
    }

    protected generateUserToken(userId: number, role: string) {
        return this.generateToken({ id: userId }, role);
    }

    protected generateAdminToken(admin: any) {
        return this.generateToken(admin, "admin");
    }

    protected setUserProfilePicture<T extends UserRepo>(userProfile: any, repo: T) {
        userProfile.profilePictureUrl = userProfile[repo.imageRelation].length != 0 ? userProfile[repo.imageRelation][0].imageUrl : null;
    }
}