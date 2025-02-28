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
exports.default = processImage;
const mime_1 = __importDefault(require("mime"));
const _1 = require(".");
function processImage(image) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = image.path;
        const outputPath = `compressed/${image.filename}`;
        const mimeType = mime_1.default.lookup(filePath);
        const fileName = image.filename;
        return yield (0, _1.convertImage)(fileName, filePath, outputPath, mimeType);
    });
}
