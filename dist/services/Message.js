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
const repos_1 = require("../repos");
const BaseService_1 = __importDefault(require("./bases/BaseService"));
class Message extends BaseService_1.default {
    constructor() {
        super(new repos_1.Message());
    }
    createMessage(userId, text, chatId, recipientOnline, senderType, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.insert({ senderId: userId, text, chatId, recipientOnline, senderType });
            const repoResultError = _super.handleRepoError.call(this, dataType, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.responseData.call(this, dataType, 201, false, "Message has been created successfully", repoResult.data);
        });
    }
    deleteMessage(messageId, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.deleteWithId(messageId);
            const repoResultError = _super.handleRepoError.call(this, dataType, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.responseData.call(this, dataType, 200, false, "Message has been deleted successfully");
        });
    }
    updateOfflineMessages(chatIds, userType, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const updateOfflineMessagesRepoResult = yield this.repo.updateOfflineMessages(chatIds, userType.toUpperCase());
            const updateOfflineMessagesRepoResultError = _super.handleRepoError.call(this, dataType, updateOfflineMessagesRepoResult);
            if (updateOfflineMessagesRepoResultError)
                return updateOfflineMessagesRepoResultError;
            return _super.responseData.call(this, dataType, 200, false, "Messages has been updated successfully", updateOfflineMessagesRepoResult.data);
        });
    }
    markMessagesAsRead(chatId, senderType, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.markMessagesAsRead(chatId, senderType);
            const repoResultError = _super.handleRepoError.call(this, dataType, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.responseData.call(this, dataType, 200, false, "Messages has been marked as read", repoResult.data);
        });
    }
}
exports.default = Message;
