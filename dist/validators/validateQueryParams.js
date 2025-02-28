"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const numberValidator_1 = __importDefault(require("./numberValidator"));
const validateQueryParams = (params) => (req, res, next) => {
    const sanitizedQuery = {};
    for (const param of params) {
        const value = req.query[param.name];
        // Check if parameter is missing
        if (value === undefined || value === null) {
            res.status(400).json({
                error: true,
                message: `${param.name} is missing`,
            });
            return;
        }
        if (param.type === "number") {
            const numberResult = (0, numberValidator_1.default)(value);
            if (numberResult.error) {
                res.status(400).json({
                    error: true,
                    message: `${param.name} must be a valid number`
                });
                return;
            }
            sanitizedQuery[param.name] = numberResult.number;
        }
        else if (typeof value !== param.type) {
            res.status(400).json({
                error: true,
                message: `${param.name} must be of type ${param.type}`,
            });
            return;
        }
        else {
            sanitizedQuery[param.name] = value;
        }
    }
    req.query = sanitizedQuery;
    next();
};
exports.default = validateQueryParams;
