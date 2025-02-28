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
const UserRepo_1 = __importDefault(require("./bases/UserRepo"));
class Vendor extends UserRepo_1.default {
    constructor() {
        super("vendor", "profilePicture");
    }
    updateVendor(id, data) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.update.call(this, { id: id }, data);
        });
    }
    updateFirstName(id, firstName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.updateVendor(id, { firstName: firstName });
        });
    }
    updateLastName(id, lastName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.updateVendor(id, { lastName: lastName });
        });
    }
    updateEmail(id, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.updateVendor(id, { email: email, verified: false });
        });
    }
}
exports.default = Vendor;
