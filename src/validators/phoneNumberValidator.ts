import { isValidPhoneNumber } from "libphonenumber-js";
import { validations } from "../constants";


export default function phoneNumberValidator(phoneNumber: string) {
    if (isValidPhoneNumber(phoneNumber)) {
        return null;
    } else {
        return validations('phoneNumber');
    }
}