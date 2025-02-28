"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = bodyValidator;
function bodyValidator(requestBody, neededAttributes) {
    if (neededAttributes.length > 1) {
        for (let attr of neededAttributes) {
            if (!requestBody[attr]) {
                return {
                    error: true,
                    message: "all values are required",
                    "missing value": attr,
                };
            }
        }
    }
    else {
        if (!requestBody[neededAttributes[0]]) {
            return {
                error: true,
                message: `${neededAttributes[0]} needed`,
                "missing value": neededAttributes[0],
            };
        }
    }
    return requestBody;
}
