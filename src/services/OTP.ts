import { randomInt } from "../utils";
import { Email } from ".";
import { OTPCache } from "../cache";
import constants, { http } from "../constants";
import BaseService from "./bases/BaseService";


// TODO: Refractor this Service

export default class OTP extends BaseService {

    private readonly email: string;
    private readonly templateData: any;
    private otpCode!: string;
    private readonly cache: OTPCache;

    public constructor(email: string, private readonly cachePreKey: string, templateData: any = null) {
        super();
        this.email = email;
        this.templateData = templateData;
        this.cache = new OTPCache(cachePreKey);
    }

    private generateOTP() {
        let otp: string = "";
        for (let i = 0; i <= 5; i++) otp += randomInt(0, 9);
        return otp;
    }

    private async storeOTP() {
        return await this.cache.set(this.email, this.otpCode);
    }

    private async sendOTP() {
        const email = new Email();
        const emailContent = await email.getEmailTemplate(this.templateData);
        const mailResult = await email.sendEmail(
            "Ecommerce Api",
            this.email,
            "Email Verification",
            emailContent as string
        );
        return mailResult;
    }

    private setOTP() {
        this.otpCode = this.generateOTP();
        this.templateData.otpCode = this.otpCode;
    }

    public async send() {
        this.setOTP();
        const storedOTP = await this.storeOTP();

        if (storedOTP) {
            const sentOTP = await this.sendOTP();
            const error: boolean = sentOTP ? false : true;
            const statusCode: number = sentOTP ? 200 : 500;
            const message: string = sentOTP ? "OTP has been sent successfully" : http("500")!;

            return super.httpResponseData(statusCode, error, message);
        }
        return super.httpResponseData(500, true, constants("failedCache")!);
    }

    public async confirmOTP(otpCode: string) {
        const cacheResult = await this.cache.get(this.email);

        if (cacheResult.error) {
            return super.httpResponseData(500, cacheResult.error, http("500")!);
        }

        if (!cacheResult.otpCode) {
            return super.httpResponseData(404, true, "OTP code was no found");
        }

        const validOTPCode = cacheResult.otpCode === otpCode;
        const message = validOTPCode ? "Email has been verified successfully" : "Invalid otp";
        const statusCode = validOTPCode ? 200 : 401;
        const error = statusCode == 200;
        return super.httpResponseData(statusCode, !error, message);
    }

    public async deleteOTP() {
        const deleted: boolean = await this.cache.delete(this.email);
        const message: string | null = deleted ? null : http("500")!;
        const statusCode: number = deleted ? 500 : 200;
        return super.httpResponseData(statusCode, !deleted, message);
    }
}