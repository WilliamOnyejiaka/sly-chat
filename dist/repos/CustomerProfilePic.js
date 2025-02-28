"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ImageRepo_1 = __importDefault(require("./bases/ImageRepo"));
class CustomerProfilePic extends ImageRepo_1.default {
    constructor() {
        super('customerProfilePic', 'customerId');
    }
}
exports.default = CustomerProfilePic;
