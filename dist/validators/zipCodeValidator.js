"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = zipCodeValidator;
function zipCodeValidator(zipCode) {
    const length = zipCode.length;
    const zipCodePattern = /^\d{5}(-\d{4})?$/;
    if (!(length >= 5 || length <= 10)) {
        return {
            error: true,
            message: "Zip code must be between 5 and 10 characters"
        };
    }
    if (!zipCodePattern.test(zipCode)) {
        return {
            error: true,
            message: "Invalid zip code format"
        };
    }
    return {
        error: false,
        message: null
    };
}
