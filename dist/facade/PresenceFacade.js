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
const cache_1 = require("../cache");
const BaseFacade_1 = __importDefault(require("./bases/BaseFacade"));
const enums_1 = require("../types/enums");
const services_1 = require("../services");
class PresenceFacade extends BaseFacade_1.default {
    constructor() {
        super();
        this.onlineCustomer = new cache_1.OnlineCustomer();
        this.onlineVendor = new cache_1.OnlineVendor();
        this.onlineAdmin = new cache_1.OnlineAdmin();
        this.chatService = new services_1.Chat();
    }
    setOnlineUser(userId, socketId, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const setMethods = {
                [enums_1.UserType.Admin]: this.onlineAdmin.set.bind(this.onlineAdmin),
                [enums_1.UserType.Customer]: this.onlineCustomer.set.bind(this.onlineCustomer),
                [enums_1.UserType.Vendor]: this.onlineVendor.set.bind(this.onlineVendor)
            };
            const setMethod = setMethods[user];
            if (setMethod) {
                const successful = yield setMethod(String(userId), {
                    socketId: socketId
                });
                return !successful ? this.service.socketResponseData(500, true, "Something went wrong") : this.service.socketResponseData(200, false);
            }
            return this.service.socketResponseData(500, true, "Invalid user type");
        });
    }
    deleteOnlineUser(userId, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleteMethods = {
                [enums_1.UserType.Admin]: this.onlineAdmin.delete.bind(this.onlineAdmin),
                [enums_1.UserType.Customer]: this.onlineCustomer.delete.bind(this.onlineCustomer),
                [enums_1.UserType.Vendor]: this.onlineVendor.delete.bind(this.onlineVendor)
            };
            const deleteMethod = deleteMethods[userType];
            if (deleteMethod) {
                const unsuccessful = yield deleteMethod(userId);
                return !unsuccessful ? this.service.socketResponseData(500, true, "Something went wrong") : this.service.socketResponseData(200, false);
            }
            return this.service.socketResponseData(500, true, "Invalid user type");
        });
    }
    getUserTransactionChatRooms(userId, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userType == enums_1.UserType.Admin)
                return this.service.socketResponseData(200, false, null, []);
            const serviceResult = yield this.chatService.getChatIds(userId, userType, enums_1.ServiceResultDataType.SOCKET);
            if (serviceResult.error)
                return serviceResult;
            return serviceResult;
        });
    }
}
exports.default = PresenceFacade;
