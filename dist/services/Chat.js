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
const enums_1 = require("../types/enums");
class Chat extends BaseService_1.default {
    constructor() {
        super(new repos_1.Chat());
    }
    createChatWithMessage(newChat, newMessage, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const newChatResult = yield this.repo.insertChatWithMessage(newChat, newMessage);
            const newChatResultError = _super.handleRepoError.call(this, dataType, newChatResult);
            if (newChatResultError)
                return newChatResultError;
            return _super.responseData.call(this, dataType, 201, false, "Chat has been created successfully", newChatResult.data);
        });
    }
    getUserChats(userId, userType, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield (userType == enums_1.UserType.Customer ? this.repo.getCustomerChatsWithMessages(userId) : this.repo.getVendorChatsWithMessages(userId));
            const repoResultError = _super.handleRepoError.call(this, dataType, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.responseData.call(this, dataType, 200, false, "Chats has been retrieved successfully", repoResult.data);
        });
    }
    getChat(chatId, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.getChatWithMessages({ id: chatId });
            const repoResultError = _super.handleRepoError.call(this, dataType, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.responseData.call(this, dataType, 200, false, "Chats has been retrieved successfully", repoResult.data);
        });
    }
    getUserChatsWithMessages(userId, userType, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = userType === enums_1.UserType.Customer
                ? yield this.repo.getCustomerChatsWithMessages(userId)
                : yield this.repo.getVendorChatsWithMessages(userId);
            const repoResultError = _super.handleRepoError.call(this, dataType, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.responseData.call(this, dataType, 200, false, "Chats and messages has been retrieved successfully", repoResult.data);
        });
    }
    getChatIds(userId, userType, dataType) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.getChatIds(userId, userType);
            const repoResultError = _super.handleRepoError.call(this, dataType, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.responseData.call(this, dataType, 200, false, "Chat ids has been retrieved successfully", repoResult.data);
        });
    }
}
exports.default = Chat;
