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
const cache_1 = require("../../cache");
const enums_1 = require("../../types/enums");
const repos_1 = require("./../../repos");
const Base_1 = __importDefault(require("./bases/Base"));
class Chat extends Base_1.default {
    constructor() {
        super(...arguments);
        this.chatRepo = new repos_1.Chat();
        this.messageRepo = new repos_1.Message();
        this.onlineCustomer = new cache_1.OnlineCustomer();
        this.onlineVendor = new cache_1.OnlineVendor();
    }
    updateOnlineCache(userId, userType, socket) {
        const _super = Object.create(null, {
            handleServiceResultError: { get: () => super.handleServiceResultError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const cache = userType === enums_1.UserType.Customer ? this.onlineCustomer : this.onlineVendor;
            const onlineCache = yield cache.get(userId);
            if (onlineCache.error)
                return _super.handleServiceResultError.call(this, "🛑 Failed to get user cache", _super.responseData.call(this, 500, true, "Something went wrong"));
            const onlineData = onlineCache.data;
            const onlineDataErrorMessage = "Connect to presence namespace first";
            if (!onlineData)
                return _super.handleServiceResultError.call(this, onlineDataErrorMessage, _super.responseData.call(this, 400, true, onlineDataErrorMessage));
            const socketId = JSON.parse(onlineData).socketId;
            const successful = yield cache.set(userId, {
                chatSocketId: socket.id,
                socketId,
            });
            if (!successful)
                return _super.handleServiceResultError.call(this, "🛑 Caching was unsuccessful", _super.responseData.call(this, 500, true, "Something went wrong"));
            return _super.responseData.call(this, 200, false);
        });
    }
    // public async getUserChatsAndOfflineMessages(userId: string, userType: UserType): Promise<ServiceData> {
    //     const repoResult = userType === UserType.Customer
    //         ? await this.chatRepo.getCustomerChatsWithMessages(userId)
    //         : await this.chatRepo.getVendorChatsWithMessages(userId);
    //     const repoResultError = super.handleRepoError(repoResult);
    //     if (repoResultError) return repoResultError;
    //     const chat = repoResult.data;
    //     let offlineMessages = chat.flatMap((item: any) => item.messages.filter((message: any) => message.recipientOnline === false));
    //     const chatIds = offlineMessages.map((item: any) => item.chatId);
    //     const updateOfflineMessagesRepoResult = await this.messageRepo.updateOfflineMessages(chatIds, userId, userType);
    //     const updateOfflineMessagesRepoResultError = super.handleRepoError(updateOfflineMessagesRepoResult);
    //     if (updateOfflineMessagesRepoResultError) return updateOfflineMessagesRepoResultError;
    //     offlineMessages = offlineMessages.map((item: any) => {
    //         item.recipientOnline = true;
    //         return item;
    //     });
    //     const rooms = chat.length > 0 ? chat.map((item: any) => item.id) : null;
    //     return super.responseData(200, false, null, { chat, offlineMessages, rooms });
    // }
    getChatWithMessages(id) {
        const _super = Object.create(null, {
            handleRepoError: { get: () => super.handleRepoError },
            responseData: { get: () => super.responseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.chatRepo.getChatWithMessages({ id });
            const repoResultError = _super.handleRepoError.call(this, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.responseData.call(this, 200, false, null, repoResult.data);
        });
    }
}
exports.default = Chat;
