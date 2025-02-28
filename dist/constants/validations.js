"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validations;
function validations(key) {
    return {
        'phoneNumber': "Invalid phone number format",
        '400Email': "Email already exists"
    }[key];
}
