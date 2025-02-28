"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatus = exports.imageFolders = exports.urls = exports.authorizationTypes = exports.http = exports.validations = void 0;
exports.default = constants;
const validations_1 = __importDefault(require("./validations"));
exports.validations = validations_1.default;
const http_1 = __importDefault(require("./http"));
exports.http = http_1.default;
const authorizationTypes_1 = __importDefault(require("./authorizationTypes"));
exports.authorizationTypes = authorizationTypes_1.default;
const urls_1 = __importDefault(require("./urls"));
exports.urls = urls_1.default;
const imageFolders_1 = __importDefault(require("./imageFolders"));
exports.imageFolders = imageFolders_1.default;
const HttpStatus_1 = __importDefault(require("./HttpStatus"));
exports.HttpStatus = HttpStatus_1.default;
function constants(key) {
    const message404 = " was not found";
    const message200 = " has been retrieved successfully";
    return {
        'failedCache': "Failed to cache data",
        '404Vendor': "Vendor was not found.",
        '404User': "User was not found.",
        'updatedVendor': "Vendor has been updated successfully.",
        'deletedVendor': "Vendor has been deleted successfully",
        'deletedStore': "Store has been deleted successfully",
        '404Image': "Image was not found",
        '201ProfilePic': "Profile picture was uploaded successfully",
        '400Email': "Invalid email",
        'service400Email': "Email already exists",
        '200Role': "Role has been retrieved successfully",
        '200Roles': "Roles were retrieved successfully",
        '200Vendors': "Vendors were retrieved successfully",
        '404Admin': "Admin was not found",
        '200Permission': "Permission has been retrieved successfully",
        '200Permissions': "Permissions were retrieved successfully",
        '200AdminPermissions': "AdminPermissions were retrieved successfully",
        '200AdminPermission': "AdminPermission has been retrieved successfully",
        '200tore': "Store has been retrieved successfully",
        '200Stores': "Stores were retrieved successfully",
        '200Category': "Category has been retrieved successfully",
        '200Categories': "Categories were retrieved successfully",
        '404Customer': "Customer" + message404,
        '200Customer': "Customer" + message200,
        '200Customers': "Customers" + message200,
        '200Users': "Users were retrieved successfully",
        '200User': "User has been retrieved successfully"
    }[key];
}
