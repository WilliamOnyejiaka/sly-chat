"use strict";
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
const config_1 = require("../config");
const BaseService_1 = __importDefault(require("./bases/BaseService"));
const constants_1 = require("../constants");
class Cloudinary extends BaseService_1.default {
    constructor() {
        super();
    }
    getUrl(publicId) {
        return config_1.cloudinary.url(publicId, {
            transformation: [
                { fetch_format: 'auto' },
                { quality: 'auto' }
            ]
        });
    }
    uploadImage(filePath, imageFolder) {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let uploadResult = null;
            let folder = (0, constants_1.imageFolders)(imageFolder);
            try {
                uploadResult = yield config_1.cloudinary.uploader.upload(filePath, { resource_type: "auto", folder: folder });
            }
            catch (error) {
                config_1.logger.error(`Error uploading file: ${error.message}`, { filePath, imageFolder });
                return _super.httpResponseData.call(this, 500, true, (0, constants_1.http)('500'));
            }
            const url = this.getUrl(uploadResult.public_id);
            return _super.httpResponseData.call(this, 201, false, null, {
                imageData: uploadResult,
                url
            });
        });
    }
    updateImage(filePath, publicID) {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const uploadResult = yield config_1.cloudinary.uploader.upload(filePath, {
                    public_id: publicID,
                    overwrite: true // Ensures the image is replaced
                });
                const url = this.getUrl(uploadResult.public_id);
                return _super.httpResponseData.call(this, 201, false, null, {
                    imageData: uploadResult,
                    url
                });
            }
            catch (error) {
                config_1.logger.error(`Error updating file: ${error.message}`, { filePath });
                return _super.httpResponseData.call(this, 500, true, (0, constants_1.http)('500'));
            }
        });
    }
    fileOptions(type) {
        const resourceMap = {
            'image': {},
            'audio': { resource_type: "video" },
            'video': { resource_type: "video" },
        };
        return resourceMap[type] || {};
    }
    delete(publicID_1) {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, arguments, void 0, function* (publicID, type = "image") {
            const options = this.fileOptions(type);
            try {
                const response = yield config_1.cloudinary.uploader.destroy(publicID, options);
                if (response.result == "ok") {
                    return _super.httpResponseData.call(this, 200, false, "File has been deleted");
                }
                return _super.httpResponseData.call(this, 404, true, "File not found");
            }
            catch (error) {
                config_1.logger.error(`Error deleting file: ${error.message}`);
                return _super.httpResponseData.call(this, 500, true, (0, constants_1.http)('500'));
            }
        });
    }
}
exports.default = Cloudinary;
