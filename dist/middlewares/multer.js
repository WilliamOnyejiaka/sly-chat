"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeImagesUploads = exports.bannerUploads = void 0;
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const bannerFields = ['firstBanner', 'secondBanner'];
const storeImagesFields = ['firstBanner', 'secondBanner', 'storeLogo', 'name', 'address'];
const fileSize = 3.0 * 1024 * 1024;
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    return cb(null, true);
};
const uploads = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 3.0 * 1024 * 1024
    },
    fileFilter: fileFilter
});
const bannerFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    if (!bannerFields.includes(file.fieldname)) {
        return cb(new Error("INVALID_BANNER_FIELD_NAME"));
    }
    return cb(null, true);
};
exports.bannerUploads = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: fileSize
    },
    fileFilter: bannerFilter
});
const storeImagesFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    if (!storeImagesFields.includes(file.fieldname)) {
        return cb(new Error("INVALID_FIELD_NAME"));
    }
    return cb(null, true);
};
exports.storeImagesUploads = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: fileSize
    },
    fileFilter: storeImagesFilter
});
exports.default = uploads;
