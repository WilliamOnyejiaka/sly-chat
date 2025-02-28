"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseCache_1 = __importDefault(require("./BaseCache"));
class VendorCache extends BaseCache_1.default {
    constructor() {
        super('vendor', 2592000);
    }
}
exports.default = VendorCache;
