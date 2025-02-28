"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseCache_1 = __importDefault(require("./BaseCache"));
class OnlineCustomer extends BaseCache_1.default {
    constructor() {
        super('onlineCustomer');
    }
}
exports.default = OnlineCustomer;
