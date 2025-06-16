import { UserType } from "../../types/enums";
import validateBody from "../validateBody";
import {
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
    tokenIsPresent,
    userEmailExists,
    zipCodeIsValid,
    paramNumberIsValid
} from "../validators";

export const createProductComment = [
    validateBody([
        'productId',
        'content'
    ])
];

export const productId = [
    paramNumberIsValid('productId')
];