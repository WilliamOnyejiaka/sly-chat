"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const repos_1 = require("../repos");
const cache_1 = require("../cache");
const UserService_1 = __importDefault(require("./bases/UserService"));
class Customer extends UserService_1.default {
    constructor() {
        super(new repos_1.Customer(), new cache_1.CustomerCache(), new repos_1.CustomerProfilePic());
    }
}
exports.default = Customer;
