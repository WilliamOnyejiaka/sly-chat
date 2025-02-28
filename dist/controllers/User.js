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
const express_validator_1 = require("express-validator");
const Controller_1 = __importDefault(require("./bases/Controller"));
const facade_1 = require("../facade");
const enums_1 = require("../types/enums");
class User {
    static createUser(userType) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const validationErrors = (0, express_validator_1.validationResult)(req);
            if (!validationErrors.isEmpty()) {
                Controller_1.default.handleValidationErrors(res, validationErrors);
                return;
            }
            const facadeResult = yield User.facade.createUser(req.body, userType);
            Controller_1.default.response(res, facadeResult);
        });
    }
    static createVendor() {
        return User.createUser(enums_1.UserType.Vendor);
    }
    static createCustomer() {
        return User.createUser(enums_1.UserType.Customer);
    }
}
User.facade = new facade_1.UserManagementFacade();
exports.default = User;
