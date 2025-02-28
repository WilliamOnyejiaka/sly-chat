"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyBooleanIsValid = exports.queryIsValidNumber = exports.pageSizeQueryIsValid = exports.pageQueryIsValid = exports.itemNameExists = exports.bodyNumberIsValid = exports.paramNumberIsValid = exports.tokenIsPresent = exports.zipCodeIsValid = exports.userPhoneNumberExists = exports.userEmailExists = exports.emailIsValid = exports.phoneNumberIsValid = exports.passwordIsValid = void 0;
const express_validator_1 = require("express-validator");
const validators_1 = require("../validators");
const constants_1 = __importStar(require("../constants"));
const errorDetails = (message, statusCode) => {
    return JSON.stringify({
        message: message,
        statusCode: statusCode
    });
};
const isValidPassword = (value, { req, location, path }) => {
    if (value.length < 5) {
        throw new Error(errorDetails("Password must be greater than 5", constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
};
const isValidPhoneNumber = (value) => {
    const phoneNumberIsValid = (0, validators_1.phoneNumberValidator)(value);
    if (phoneNumberIsValid !== null) {
        throw new Error(errorDetails(phoneNumberIsValid, constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
};
const isValidEmail = (value) => {
    if (!(0, validators_1.emailValidator)(value)) {
        throw new Error(errorDetails((0, constants_1.default)('400Email'), constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
};
const emailExists = (repo) => (value) => __awaiter(void 0, void 0, void 0, function* () {
    const repoResult = yield repo.getUserProfileWithEmail(value);
    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    }
    else if (repoResult.data) {
        throw new Error(errorDetails("Email already exists", constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
});
const phoneNumberExists = (repo) => (value) => __awaiter(void 0, void 0, void 0, function* () {
    const repoResult = yield repo.getUserWithPhoneNumber(value);
    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    }
    else if (repoResult.data) {
        throw new Error(errorDetails("Phone number already exists", constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
});
const nameExists = (repo) => (value) => __awaiter(void 0, void 0, void 0, function* () {
    const repoResult = yield repo.getItemWithName(value);
    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    }
    else if (repoResult.data) {
        throw new Error(errorDetails("Name already exists", constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
});
const isValidZipCode = (value) => {
    const isValid = (0, validators_1.zipCodeValidator)(value);
    if (isValid.error) {
        throw new Error(errorDetails(isValid.message, constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
};
const isTokenPresent = (value, { req, location, path }) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        throw new Error(errorDetails("Missing Bearer Authorization Header", constants_1.HttpStatus.UNAUTHORIZED));
    }
    if (!req.headers.authorization.split(' ')[1]) {
        throw new Error(errorDetails("Token missing", constants_1.HttpStatus.UNAUTHORIZED));
    }
    return true;
};
const isValidNumber = (value) => {
    const idResult = (0, validators_1.numberValidator)(value);
    if (idResult.error) {
        throw new Error(errorDetails("Param must be an integer", constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
};
const isValidBoolean = (message) => (value) => {
    if (typeof value !== "boolean") {
        throw new Error(errorDetails(message, constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
};
const validateQueryNumber = (name) => (value) => {
    const numberResult = (0, validators_1.numberValidator)(value);
    if (numberResult.error) {
        throw new Error(errorDetails(`${name} query param must be an integer`, constants_1.HttpStatus.BAD_REQUEST));
    }
    return true;
};
exports.passwordIsValid = (0, express_validator_1.body)('password').custom(isValidPassword); // Custom password validation
exports.phoneNumberIsValid = (0, express_validator_1.body)('phoneNumber').custom(isValidPhoneNumber);
exports.emailIsValid = (0, express_validator_1.body)('email').custom(isValidEmail);
const userEmailExists = (repo) => (0, express_validator_1.body)('email').custom(emailExists(repo));
exports.userEmailExists = userEmailExists;
const userPhoneNumberExists = (repo) => (0, express_validator_1.body)('phoneNumber').custom(phoneNumberExists(repo));
exports.userPhoneNumberExists = userPhoneNumberExists;
exports.zipCodeIsValid = (0, express_validator_1.body)('zip').custom(isValidZipCode);
exports.tokenIsPresent = (0, express_validator_1.header)('Authorization').custom(isTokenPresent);
const paramNumberIsValid = (paramName) => (0, express_validator_1.param)(paramName).custom(isValidNumber);
exports.paramNumberIsValid = paramNumberIsValid;
const bodyNumberIsValid = (bodyName) => (0, express_validator_1.body)(bodyName).custom(isValidNumber);
exports.bodyNumberIsValid = bodyNumberIsValid;
const itemNameExists = (repo, bodyName) => (0, express_validator_1.body)(bodyName).custom(nameExists(repo));
exports.itemNameExists = itemNameExists;
exports.pageQueryIsValid = (0, express_validator_1.query)('page').custom(validateQueryNumber('page'));
exports.pageSizeQueryIsValid = (0, express_validator_1.query)('pageSize').custom(validateQueryNumber('pageSize'));
const queryIsValidNumber = (queryName) => (0, express_validator_1.query)(queryName).custom(validateQueryNumber(queryName));
exports.queryIsValidNumber = queryIsValidNumber;
const bodyBooleanIsValid = (bodyName) => (0, express_validator_1.body)(bodyName).custom(isValidBoolean(`${bodyName} must be a boolean`));
exports.bodyBooleanIsValid = bodyBooleanIsValid;
