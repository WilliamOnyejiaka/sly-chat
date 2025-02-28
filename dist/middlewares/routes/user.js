"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logOut = exports.login = exports.createCustomer = exports.createVendor = void 0;
const repos_1 = require("../../repos");
const validateBody_1 = __importDefault(require("../validateBody"));
const validators_1 = require("../validators");
const createUser = [
    (0, validateBody_1.default)([
        'firstName',
        'lastName',
        'active',
        'email',
        'verified',
        'userId'
    ]),
];
exports.createVendor = [
    ...createUser,
    (0, validators_1.userEmailExists)(new repos_1.Vendor())
];
exports.createCustomer = [
    ...createUser,
    (0, validators_1.userEmailExists)(new repos_1.Customer())
];
exports.login = [
    (0, validateBody_1.default)(['email', 'password'])
];
exports.logOut = [
    validators_1.tokenIsPresent
];
