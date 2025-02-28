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
const express_validator_1 = require("express-validator");
const Controller_1 = __importDefault(require("./bases/Controller"));
const facade_1 = require("../facade");
class Chat {
    static getUserChats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationErrors = (0, express_validator_1.validationResult)(req);
            if (!validationErrors.isEmpty()) {
                Controller_1.default.handleValidationErrors(res, validationErrors);
                return;
            }
            const userId = res.locals.data.id;
            const userType = res.locals.data.userType;
            const facadeResult = yield Chat.facade.httpGetUserChats(userId, userType);
            Controller_1.default.response(res, facadeResult);
        });
    }
    static getChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationErrors = (0, express_validator_1.validationResult)(req);
            if (!validationErrors.isEmpty()) {
                Controller_1.default.handleValidationErrors(res, validationErrors);
                return;
            }
            const chatId = req.params.chatId;
            const facadeResult = yield Chat.facade.httpGetChat(chatId);
            Controller_1.default.response(res, facadeResult);
        });
    }
    static deleteMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationErrors = (0, express_validator_1.validationResult)(req);
            if (!validationErrors.isEmpty()) {
                Controller_1.default.handleValidationErrors(res, validationErrors);
                return;
            }
            const messageId = req.params.messageId;
            const facadeResult = yield Chat.facade.httpDeleteMessage(messageId);
            Controller_1.default.response(res, facadeResult);
        });
    }
}
Chat.facade = new facade_1.ChatManagementFacade();
exports.default = Chat;
