import { body, header, param, query } from "express-validator";
import { emailValidator, numberValidator, phoneNumberValidator, zipCodeValidator } from "../validators";
import constants, { HttpStatus } from "../constants";
// import UserRepo from "../repos/bases/UserRepo";
import Repo from "../repos/bases/Repo";
import  UserRepo  from "../repos/bases/UserRepo";
import { UserType } from "../types/enums";

const errorDetails = (message: string, statusCode: number) => {
    return JSON.stringify({
        message: message,
        statusCode: statusCode
    });
}

const isValidPassword = (value: string, { req, location, path }: { req: any, location: string, path: string }) => {
    if (value.length < 5) {
        throw new Error(errorDetails("Password must be greater than 5", HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isValidPhoneNumber = (value: string) => {
    const phoneNumberIsValid = phoneNumberValidator(value);

    if (phoneNumberIsValid !== null) {
        throw new Error(errorDetails(phoneNumberIsValid!, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isValidEmail = (value: string) => {
    if (!emailValidator(value)) {
        throw new Error(errorDetails(constants('400Email')!, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const emailExists = (repo: any, userType: UserType) => async (value: string) => {
    const repoResult = await repo.userEmailExists(value, userType.toUpperCase());

    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    } else if (repoResult.data) {
        throw new Error(errorDetails("Email already exists", HttpStatus.BAD_REQUEST));
    }
    return true;
}

const nameExists = <T extends Repo>(repo: T) => async (value: string) => {
    const repoResult = await repo.getItemWithName(value);

    if (repoResult.error) {
        throw new Error(JSON.stringify({
            message: repoResult.message,
            statusCode: repoResult.type
        }));
    } else if (repoResult.data) {
        throw new Error(errorDetails("Name already exists", HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isValidZipCode = (value: string) => {
    const isValid = zipCodeValidator(value);
    if (isValid.error) {
        throw new Error(errorDetails(isValid.message!, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isTokenPresent = (value: string, { req, location, path }: { req: any, location: string, path: string }) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1) {
        throw new Error(errorDetails("Missing Bearer Authorization Header", HttpStatus.UNAUTHORIZED));
    }
    if (!req.headers.authorization.split(' ')[1]) {
        throw new Error(errorDetails("Token missing", HttpStatus.UNAUTHORIZED));
    }
    return true;
}

const isValidNumber = (name: string) => (value: string) => {
    const idResult = numberValidator(value);

    if (idResult.error) {
        throw new Error(errorDetails(`${name} must be an integer`, HttpStatus.BAD_REQUEST));
    }
    return true;
}

const isValidBoolean = (message: string) => (value: string) => {
    if (typeof value !== "boolean") {
        throw new Error(errorDetails(message, HttpStatus.BAD_REQUEST));
    }
    return true;
}


const validateQueryNumber = (name: string) => (value: string) => {
    const numberResult = numberValidator(value);

    if (numberResult.error) {
        throw new Error(errorDetails(`${name} query param must be an integer`, HttpStatus.BAD_REQUEST));
    }
    return true;
}


export const passwordIsValid = body('password').custom(isValidPassword); // Custom password validation
export const phoneNumberIsValid = body('phoneNumber').custom(isValidPhoneNumber);
export const emailIsValid = body('email').custom(isValidEmail);
export const userEmailExists = (repo: any, userType: UserType) => body('email').custom(emailExists(repo, userType));
export const zipCodeIsValid = body('zip').custom(isValidZipCode);
export const tokenIsPresent = header('Authorization').custom(isTokenPresent);
export const paramNumberIsValid = (paramName: string) => param(paramName).custom(isValidNumber(paramName));
export const bodyNumberIsValid = (bodyName: string) => body(bodyName).custom(isValidNumber(bodyName));
export const itemNameExists = <T extends Repo>(repo: T, bodyName: string) => body(bodyName).custom(nameExists<T>(repo));
export const pageQueryIsValid = query('page').custom(validateQueryNumber('page'));
export const pageSizeQueryIsValid = query('pageSize').custom(validateQueryNumber('pageSize'));
export const queryIsValidNumber = (queryName: string) => query(queryName).custom(validateQueryNumber(queryName));
export const bodyBooleanIsValid = (bodyName: string) => body(bodyName).custom(isValidBoolean(`${bodyName} must be a boolean`));
