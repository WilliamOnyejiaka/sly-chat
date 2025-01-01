import { UserRegistration, Auth, UserOTP } from "../services";
import VendorDto, { CustomerAddressDto } from "../types/dtos";
import { UserType } from "./../types/enums";
import BaseFacade from "./bases/BaseFacade";

export default class AuthenticationManagementFacade extends BaseFacade {

    private readonly userRegistrationService: UserRegistration = new UserRegistration();
    private readonly authService: Auth = new Auth();
    private readonly userOTPService: UserOTP = new UserOTP();

    public async vendorSignUp(vendorDto: VendorDto) {
        return await this.userRegistrationService.vendorSignUp(vendorDto)
    }

    public async customerSignUp(customerData: {
        firstName: string;
        lastName: string;
        password: string;
        email: string;
        phoneNumber: string;
    }, addressData: CustomerAddressDto) {
        return await this.userRegistrationService.customerSignUp(customerData, addressData);
    }

    public async adminSignUp(adminData: {
        firstName: string;
        lastName: string;
        email: string;
        active: boolean;
        phoneNumber: string;
        key?: string;
        roleId?: number;
    }) {
        return await this.userRegistrationService.adminSignUp(adminData)
    }

    /**
     * General login method that works for customer, admin, and vendor
     * @param email User email
     * @param password User password
     * @param user User type (customer, admin, or vendor)
     */
    public async login(email: string, password: string, user: UserType) {
        const loginMethods = {
            [UserType.Admin]: this.authService.adminLogin.bind(this.authService),
            [UserType.Customer]: this.authService.customerLogin.bind(this.authService),
            [UserType.Vendor]: this.authService.vendorLogin.bind(this.authService)
        };

        const loginMethod = loginMethods[user];
        return loginMethod ? await loginMethod(email, password) : this.service.responseData(500, true, "Invalid user type");
    }

    /**
     * Logs a user out with their a jwt token
     * @param token User jwt token
     */
    public async logOut(token: string) {
        return await this.authService.logOut(token);
    }


    /**
     * Sends OTP to the user based on their type
     * @param email User email
     * @param user User type (customer, admin, or vendor)
     */
    public async sendUserOTP(email: string, user: UserType) {
        const sendOTPMethods = {
            [UserType.Vendor]: this.userOTPService.sendVendorOTP.bind(this.userOTPService),
            [UserType.Admin]: this.userOTPService.sendAdminOTP.bind(this.userOTPService),
            [UserType.Customer]: this.userOTPService.sendCustomerOTP.bind(this.userOTPService)
        };

        const sendOTPMethod = sendOTPMethods[user];
        return sendOTPMethod ? await sendOTPMethod(email) : this.service.responseData(500, true, "Invalid user type")
    }

    /**
     * Verifies email for the user based on their type and OTP code
     * @param email User email
     * @param otpCode OTP code
     * @param user User type (customer, admin, or vendor)
     */
    public async emailVerification(email: string, otpCode: string, user: UserType) {
        const verifyEmailMethods = {
            [UserType.Vendor]: this.userOTPService.vendorEmailVerification.bind(this.userOTPService),
            [UserType.Admin]: this.userOTPService.adminEmailVerification.bind(this.userOTPService),
            [UserType.Customer]: this.userOTPService.customerEmailVerification.bind(this.userOTPService)
        };

        const verifyEmailMethod = verifyEmailMethods[user];
        return verifyEmailMethod ? await verifyEmailMethod(email, otpCode) : this.service.responseData(500, true, "Invalid user type");
    }
}