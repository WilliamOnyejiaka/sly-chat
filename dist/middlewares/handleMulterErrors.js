"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                error: true,
                message: 'File exceeds the allowed size limit'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            res.status(400).json({
                error: true,
                // message: 'Unexpected field in the request',
                message: "Required field not found in request"
            });
            // return;
        }
    }
    if (err.message === 'LIMIT_INVALID_FILE_TYPE') {
        res.status(400).json({
            error: true,
            message: 'Invalid file type'
        });
    }
    if (err.message === 'INVALID_FIELD_NAME') {
        res.status(400).json({
            error: true,
            message: 'Invalid field name'
        });
    }
    next();
};
exports.default = handleMulterErrors;
