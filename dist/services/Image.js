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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseService_1 = __importDefault(require("./bases/BaseService"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const fs = __importStar(require("fs"));
const config_1 = require("../config");
const _1 = require(".");
const bytesToKB = (bytes) => (bytes / 1024).toFixed(2); // Converts bytes to KB
const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2); // Converts bytes to MB
class ImageService extends BaseService_1.default {
    constructor() {
        super();
        this.cloudinary = new _1.Cloudinary();
    }
    deleteFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletionPromises = files.map(file => {
                const filePath = typeof file === 'string' ? file : file.path;
                const fieldname = typeof file === 'string' ? undefined : file.fieldname;
                return fs.promises
                    .unlink(filePath)
                    .then(() => ({ success: true, path: filePath, fieldname }))
                    .catch(error => ({ success: false, path: filePath, fieldname, error }));
            });
            const results = yield Promise.all(deletionPromises);
            const errors = results.filter(result => !result.success);
            if (errors.length > 0) {
                config_1.logger.error(`Failed to delete some files: ${JSON.stringify(errors)}`);
                return true; // Indicate that there were errors
            }
            return false; // All deletions succeeded
        });
    }
    processAndUpload(image, imageFolder) {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, utils_1.compressImage)(image);
            if (result.error) {
                return _super.httpResponseData.call(this, 500, true, (0, constants_1.http)("500"));
            }
            const deleted = yield this.deleteFiles([image]);
            if (deleted) {
                return _super.httpResponseData.call(this, 500, true, (0, constants_1.http)('500'));
            }
            const uploadResult = yield this.cloudinary.uploadImage(result.outputPath, imageFolder);
            const deletedCompressedImage = yield this.deleteFiles([result.outputPath]);
            if (deletedCompressedImage) {
                return _super.httpResponseData.call(this, 500, true, (0, constants_1.http)('500'));
            }
            return uploadResult;
        });
    }
    uploadImages(images, uploadFolders) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Parallelize image uploads
                const uploadPromises = images.map((image) => __awaiter(this, void 0, void 0, function* () {
                    const fieldName = image.fieldname;
                    const uploadFolder = uploadFolders[fieldName];
                    const uploadResult = yield this.processAndUpload(image, uploadFolder);
                    if (uploadResult.json.error) {
                        return {
                            success: false,
                            fieldName,
                            message: `Failed to upload ${fieldName}: ${uploadResult.json.message}`,
                        };
                    }
                    return {
                        success: true,
                        fieldName,
                        data: {
                            mimeType: uploadResult.json.data.imageData.format,
                            imageUrl: uploadResult.json.data.url,
                            publicId: uploadResult.json.data.imageData.public_id,
                            size: uploadResult.json.data.imageData.bytes,
                        },
                    };
                }));
                // Wait for all uploads to complete
                const results = yield Promise.all(uploadPromises);
                // Separate successful uploads and errors
                const successfulUploads = results.filter((result) => result.success);
                const errors = results.filter((result) => !result.success);
                // Construct the storeImages object
                const uploadedImages = successfulUploads.reduce((acc, { fieldName, data }) => {
                    acc[fieldName] = data;
                    return acc;
                }, {});
                if (errors.length > 0) {
                    return {
                        success: false,
                        data: uploadedImages,
                        error: errors.map((e) => ({ fieldName: e.fieldName, message: e.message })),
                    };
                }
                return { success: true, data: uploadedImages };
            }
            catch (error) {
                console.log(error);
                return {
                    success: false,
                    error: [{ fieldName: "unknown", message: error.message || "An unexpected error occurred" }],
                };
            }
        });
    }
    uploadImage(image, parentId, repo, imageFolder) {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const imageExists = yield repo.getImage(parentId);
            if (imageExists.error) {
                yield this.deleteFiles([image]);
                return _super.httpResponseData.call(this, imageExists.type, true, imageExists.message);
            }
            if (imageExists.data) {
                yield this.deleteFiles([image]);
                return _super.httpResponseData.call(this, 400, true, "A record with this data already exists.");
            }
            const uploadResult = yield this.processAndUpload(image, imageFolder);
            if (uploadResult.json.error) {
                return uploadResult;
            }
            const repoResult = yield repo.insertImage({
                mimeType: uploadResult.json.data.imageData.format,
                imageUrl: uploadResult.json.data.url,
                publicId: uploadResult.json.data.imageData.public_id,
                size: uploadResult.json.data.imageData.bytes,
                parentId: parentId
            }); // ! TODO: Incase this fails delete from cloudinary
            return !repoResult.error ?
                _super.httpResponseData.call(this, 201, false, "Image was uploaded successfully", { imageUrl: uploadResult.json.data.url }) :
                _super.httpResponseData.call(this, repoResult.type, true, repoResult.message);
        });
    }
    deleteCloudinaryImage(publicID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cloudinary.delete(publicID);
        });
    }
}
exports.default = ImageService;
