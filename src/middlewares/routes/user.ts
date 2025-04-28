// import { User } from "../../repos";
import { UserType } from "../../types/enums";
import validateBody from "../validateBody";
import {
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
    tokenIsPresent,
    userEmailExists,
    zipCodeIsValid
} from "../validators";

// const user = new User();

const createUser = [
    validateBody([
        'firstName',
        'lastName',
        'active',
        'email',
        'verified',
        'userId'
    ])
];

export const createVendor = [
    ...createUser,
    // userEmailExists(user, UserType.Vendor)
];

export const createCustomer = [
    ...createUser,
    // userEmailExists(user, UserType.Customer)
];