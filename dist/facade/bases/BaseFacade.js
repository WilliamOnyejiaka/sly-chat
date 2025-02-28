"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const BaseService_1 = __importDefault(require("../../services/bases/BaseService"));
class BaseFacade {
    constructor(invalidTypeMessage = "Invalid type") {
        this.invalidTypeMessage = invalidTypeMessage;
        this.service = new BaseService_1.default();
    }
    handleSocketFacadeResultError(servicesResult) {
        return servicesResult.error ? this.service.socketResponseData(servicesResult.statusCode, servicesResult.error, servicesResult.message) : null;
    }
    handleServiceError(serviceResult) {
        if (serviceResult.json.error) {
            return serviceResult;
        }
        return null;
    }
    invalidType() {
        return this.service.httpResponseData(constants_1.HttpStatus.INTERNAL_SERVER_ERROR, true, this.invalidTypeMessage);
    }
}
exports.default = BaseFacade;
