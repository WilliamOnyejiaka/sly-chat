import { Admin, Customer, Vendor } from "../../repos";
import validateBody from "./validateBody";
import {
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
    tokenIsPresent,
    userEmailExists,
    userPhoneNumberExists,
    zipCodeIsValid
} from "./validators";

export const vendorSignUp = [
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email',
        'phoneNumber'
    ]),
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
    userPhoneNumberExists<Vendor>(new Vendor()),
    userEmailExists<Vendor>(new Vendor())
];

export const customerSignUp = [
    validateBody([
        'firstName',
        'lastName',
        'password',
        'email',
        'street',
        'city',
        'phoneNumber',
        'zip'
    ]),
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
    zipCodeIsValid,
    userPhoneNumberExists<Customer>(new Customer()),
    userEmailExists<Customer>(new Customer())
];

export const adminSignUp = [
    validateBody([
        "firstName",
        "password",
        "lastName",
        "email",
        "phoneNumber",
        "key"
    ]),
    emailIsValid,
    passwordIsValid,
    phoneNumberIsValid,
    userPhoneNumberExists<Admin>(new Admin()),
    userEmailExists<Admin>(new Admin())
];

export const login = [
    validateBody(['email', 'password'])
];

export const logOut = [
    tokenIsPresent
]