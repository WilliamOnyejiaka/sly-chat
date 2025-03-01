import validateBody from "../validateBody";
import {
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
    tokenIsPresent,
    // userEmailExists,
    zipCodeIsValid
} from "../validators";

const createUser = [
    validateBody([
        'firstName',
        'lastName',
        'active',
        'email',
        'verified',
        'userId'
    ]),
];

export const createVendor = [
    ...createUser,
    // userEmailExists<Vendor>(new Vendor())
];

export const createCustomer = [
    ...createUser,
    // userEmailExists<Customer>(new Customer())
];


export const login = [
    validateBody(['email', 'password'])
];

export const logOut = [
    tokenIsPresent
]