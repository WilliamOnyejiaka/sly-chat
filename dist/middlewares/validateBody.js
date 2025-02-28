"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../validators");
const validateBody = (neededAttributes) => (req, res, next) => {
    const validationResponse = (0, validators_1.bodyValidator)(req.body, neededAttributes);
    validationResponse["error"]
        ? (() => res.status(400).json(validationResponse))()
        : next();
};
exports.default = validateBody;
