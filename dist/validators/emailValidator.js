"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = emailValidator;
function emailValidator(email) {
    const emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return emailRegex.test(email);
}
