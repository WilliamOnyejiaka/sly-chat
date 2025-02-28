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
exports.default = compressImage;
const sharp_1 = __importDefault(require("sharp"));
const config_1 = require("../config");
function compressImage(image) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const outputPath = `compressed/${image.filename}`;
            yield (0, sharp_1.default)(image.path)
                .resize({
                height: 800, width: 800, fit: 'cover',
            })
                .webp({
                // lossless: true,
                quality: 80
            })
                .toFile(outputPath);
            return {
                error: false,
                outputPath: outputPath
            };
        }
        catch (error) {
            config_1.logger.error(`Error processing the image: ${error}`);
            return {
                error: true,
                outputPath: null
            };
        }
    });
}
