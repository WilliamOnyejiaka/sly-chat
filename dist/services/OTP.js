"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const _1 = require(".");
const cache_1 = require("../cache");
const constants_1 = __importStar(require("../constants"));
const BaseService_1 = __importDefault(require("./bases/BaseService"));
// TODO: Refractor this Service
class OTP extends BaseService_1.default {
    constructor(email, cachePreKey, templateData = null) {
        super();
        this.cachePreKey = cachePreKey;
        this.email = email;
        this.templateData = templateData;
        this.cache = new cache_1.OTPCache(cachePreKey);
    }
    generateOTP() {
        let otp = "";
        for (let i = 0; i <= 5; i++)
            otp += (0, utils_1.randomInt)(0, 9);
        return otp;
    }
    storeOTP() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cache.set(this.email, this.otpCode);
        });
    }
    sendOTP() {
        return __awaiter(this, void 0, void 0, function* () {
            const email = new _1.Email();
            const emailContent = yield email.getEmailTemplate(this.templateData);
            const mailResult = yield email.sendEmail("Ecommerce Api", this.email, "Email Verification", emailContent);
            return mailResult;
        });
    }
    setOTP() {
        this.otpCode = this.generateOTP();
        this.templateData.otpCode = this.otpCode;
    }
    send() {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.setOTP();
            const storedOTP = yield this.storeOTP();
            if (storedOTP) {
                const sentOTP = yield this.sendOTP();
                const error = sentOTP ? false : true;
                const statusCode = sentOTP ? 200 : 500;
                const message = sentOTP ? "OTP has been sent successfully" : (0, constants_1.http)("500");
                return _super.httpResponseData.call(this, statusCode, error, message);
            }
            return _super.httpResponseData.call(this, 500, true, (0, constants_1.default)("failedCache"));
        });
    }
    confirmOTP(otpCode) {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const cacheResult = yield this.cache.get(this.email);
            if (cacheResult.error) {
                return _super.httpResponseData.call(this, 500, cacheResult.error, (0, constants_1.http)("500"));
            }
            if (!cacheResult.otpCode) {
                return _super.httpResponseData.call(this, 404, true, "OTP code was no found");
            }
            const validOTPCode = cacheResult.otpCode === otpCode;
            const message = validOTPCode ? "Email has been verified successfully" : "Invalid otp";
            const statusCode = validOTPCode ? 200 : 401;
            const error = statusCode == 200;
            return _super.httpResponseData.call(this, statusCode, !error, message);
        });
    }
    deleteOTP() {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield this.cache.delete(this.email);
            const message = deleted ? null : (0, constants_1.http)("500");
            const statusCode = deleted ? 500 : 200;
            return _super.httpResponseData.call(this, statusCode, !deleted, message);
        });
    }
}
exports.default = OTP;
