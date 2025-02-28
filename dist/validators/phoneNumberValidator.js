"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = phoneNumberValidator;
const libphonenumber_js_1 = require("libphonenumber-js");
const constants_1 = require("../constants");
function phoneNumberValidator(phoneNumber) {
    if ((0, libphonenumber_js_1.isValidPhoneNumber)(phoneNumber)) {
        return null;
    }
    else {
        return (0, constants_1.validations)('phoneNumber');
    }
}
