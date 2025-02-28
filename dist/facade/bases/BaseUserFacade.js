"use strict";
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
const services_1 = require("../../services");
const enums_1 = require("../../types/enums");
const BaseFacade_1 = __importDefault(require("./BaseFacade"));
class BaseUserFacade extends BaseFacade_1.default {
    constructor() {
        super(...arguments);
        this.customerService = new services_1.Customer();
        this.adminService = new services_1.Vendor();
        this.vendorService = new services_1.Vendor();
    }
    getUserService(user) {
        const services = {
            [enums_1.UserType.Admin]: this.adminService,
            [enums_1.UserType.Vendor]: this.vendorService,
            [enums_1.UserType.Customer]: this.customerService,
        };
        return services[user] || null;
    }
    createUser(userData, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.getUserService(user);
            if (!service)
                return this.service.httpResponseData(500, true, "Invalid user");
            return yield service.createUser(userData);
        });
    }
    getUserProfileWithId(userId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.getUserService(user);
            if (!service)
                return this.service.httpResponseData(500, true, "Invalid user");
            return yield service.getUserProfileWithId(userId);
        });
    }
    getUserProfileWithEmail(userEmail, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.getUserService(user);
            if (!service)
                return this.service.httpResponseData(500, true, "Invalid user");
            return yield service.getUserProfileWithEmail(userEmail);
        });
    }
    deleteUser(userId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.getUserService(user);
            if (!service)
                return this.service.httpResponseData(500, true, "Invalid user");
            return yield service.deleteUser(userId);
        });
    }
}
exports.default = BaseUserFacade;
