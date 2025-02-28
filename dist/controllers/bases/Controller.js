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
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../../services");
class Controller {
    static deleteFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Controller.imageService.deleteFiles(files);
        });
    }
    static paginate(service) {
        return (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { page, pageSize } = req.query;
            const serviceResult = yield service.paginate(page, pageSize);
            res.status(serviceResult.statusCode).json(serviceResult.json);
        });
    }
    static handleValidationErrors(res, validationErrors) {
        const error = JSON.parse(validationErrors.array()[0].msg);
        res.status(error.statusCode).json({ error: true, message: error.message });
    }
    static response(res, responseData) {
        res.status(responseData.statusCode).json(responseData.json);
    }
}
Controller.imageService = new services_1.ImageService();
exports.default = Controller;
