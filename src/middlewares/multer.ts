
import multer, { FileFilterCallback } from "multer";
import * as path from "path"
import { Request, Express } from "express";

const allowedMimeTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];
const bannerFields: string[] = ['firstBanner', 'secondBanner'];
const storeImagesFields: string[] = ['firstBanner', 'secondBanner', 'storeLogo','name','address'];
const fileSize: number = 3.0 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    return cb(null, true);
}

const uploads = multer({
    storage: storage,
    limits: {
        fileSize: 3.0 * 1024 * 1024
    },
    fileFilter: fileFilter
});

const bannerFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    if (!bannerFields.includes(file.fieldname)) {
        return cb(new Error("INVALID_BANNER_FIELD_NAME"));
    }
    return cb(null, true);
}

export const bannerUploads = multer({
    storage: storage,
    limits: {
        fileSize: fileSize
    },
    fileFilter: bannerFilter
});

const storeImagesFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("LIMIT_INVALID_FILE_TYPE"));
    }
    if (!storeImagesFields.includes(file.fieldname)) {
        return cb(new Error("INVALID_FIELD_NAME"));
    }
    return cb(null, true);
}

export const storeImagesUploads = multer({
    storage: storage,
    limits: {
        fileSize: fileSize
    },
    fileFilter: storeImagesFilter
});



export default uploads;
