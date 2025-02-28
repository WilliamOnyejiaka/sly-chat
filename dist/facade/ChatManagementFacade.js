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
const cache_1 = require("../cache");
const services_1 = require("../services");
const enums_1 = require("../types/enums");
const BaseFacade_1 = __importDefault(require("./bases/BaseFacade"));
class ChatManagementFacade extends BaseFacade_1.default {
    constructor() {
        super();
        this.chatService = new services_1.Chat();
        this.messageService = new services_1.Message();
        this.onlineCustomer = new cache_1.OnlineCustomer();
        this.onlineVendor = new cache_1.OnlineVendor();
    }
    getUserChats(userId, userType, dataType) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatService.getUserChats(userId, userType, dataType);
        });
    }
    httpGetUserChats(userId, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUserChats(userId, userType, enums_1.ServiceResultDataType.HTTP);
        });
    }
    socketGetUserChats(userId, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUserChats(userId, userType, enums_1.ServiceResultDataType.SOCKET);
        });
    }
    httpGetChat(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatService.getChat(chatId, enums_1.ServiceResultDataType.HTTP);
        });
    }
    socketGetChat(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatService.getChat(chatId, enums_1.ServiceResultDataType.SOCKET);
        });
    }
    deleteMessage(messageId, dataType) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.messageService.deleteMessage(messageId, dataType);
        });
    }
    httpDeleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.deleteMessage(messageId, enums_1.ServiceResultDataType.HTTP);
        });
    }
    socketDeleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.deleteMessage(messageId, enums_1.ServiceResultDataType.SOCKET);
        });
    }
    getUserChatsAndOfflineMessages(userId, userType) {
        const _super = Object.create(null, {
            handleSocketFacadeResultError: { get: () => super.handleSocketFacadeResultError }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const dataType = enums_1.ServiceResultDataType.SOCKET;
            const serviceResult = yield this.chatService.getUserChatsWithMessages(userId, userType, dataType);
            const serviceResultError = _super.handleSocketFacadeResultError.call(this, serviceResult);
            if (serviceResultError)
                return serviceResultError;
            const chat = serviceResult.data;
            let offlineMessages = chat.flatMap((item) => item.messages.filter((message) => message.recipientOnline === false));
            const chatIds = offlineMessages.map((item) => item.chatId);
            const updateOfflineMessagesResult = yield this.messageService.updateOfflineMessages(chatIds, userType, dataType);
            const updateOfflineMessagesResultError = _super.handleSocketFacadeResultError.call(this, updateOfflineMessagesResult);
            if (updateOfflineMessagesResultError)
                return updateOfflineMessagesResultError;
            offlineMessages = offlineMessages.map((item) => {
                item.recipientOnline = true;
                return item;
            });
            const rooms = chat.length > 0 ? chat.map((item) => item.id) : null;
            return this.service.socketResponseData(200, false, null, { chat, offlineMessages, rooms });
        });
    }
    updateOnlineCache(userId, userType, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = userType === enums_1.UserType.Customer ? this.onlineCustomer : this.onlineVendor;
            const onlineCache = yield cache.get(userId);
            if (onlineCache.error)
                return this.service.socketResponseData(500, true, "Something went wrong");
            const onlineData = onlineCache.data;
            if (!onlineData)
                return this.service.socketResponseData(400, true, "Connect to presence namespace first");
            const socketId = JSON.parse(onlineData).socketId;
            const successful = yield cache.set(userId, {
                chatSocketId: socket.id,
                socketId,
            });
            if (!successful)
                this.service.socketResponseData(500, true, "Something went wrong");
            return this.service.socketResponseData(200, false);
        });
    }
    getRecipientOnlineStatus(userType, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const recipientOnlineCache = yield (userType === enums_1.UserType.Customer
                ? this.onlineVendor
                : this.onlineCustomer).get(recipientId);
            if (recipientOnlineCache.error)
                return this.service.socketResponseData(500, true, "Something went wrong");
            const data = (recipientOnlineCache === null || recipientOnlineCache === void 0 ? void 0 : recipientOnlineCache.data) ? JSON.parse(recipientOnlineCache.data) : null;
            return this.service.socketResponseData(200, false, null, data);
        });
    }
    getUserOnlineStatus(userType, recipientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const recipientOnlineCache = yield (userType === enums_1.UserType.Vendor
                ? this.onlineVendor
                : this.onlineCustomer).get(recipientId);
            if (recipientOnlineCache.error)
                return this.service.socketResponseData(500, true, "Something went wrong");
            const data = (recipientOnlineCache === null || recipientOnlineCache === void 0 ? void 0 : recipientOnlineCache.data) ? JSON.parse(recipientOnlineCache.data) : null;
            return this.service.socketResponseData(200, false, null, data);
        });
    }
    createChatWithMessage(newChat, newMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.chatService.createChatWithMessage(newChat, newMessage, enums_1.ServiceResultDataType.SOCKET));
        });
    }
    createMessage(userId, text, chatId, recipientOnline, senderType, dataType) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.messageService.createMessage(userId, text, chatId, recipientOnline, senderType, dataType));
        });
    }
    socketCreateMessage(userId, text, chatId, recipientOnline, senderType) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.createMessage(userId, text, chatId, recipientOnline, senderType, enums_1.ServiceResultDataType.SOCKET));
        });
    }
    markMessagesAsRead(chatId, senderType, dataType) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.messageService.markMessagesAsRead(chatId, senderType, dataType));
        });
    }
    socketMarkMessagesAsRead(chatId, senderType) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.markMessagesAsRead(chatId, senderType, enums_1.ServiceResultDataType.SOCKET));
        });
    }
}
exports.default = ChatManagementFacade;
