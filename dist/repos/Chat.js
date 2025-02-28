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
const _1 = __importDefault(require("."));
const Repo_1 = __importDefault(require("./bases/Repo"));
const enums_1 = require("../types/enums");
class Chat extends Repo_1.default {
    constructor() {
        super('chat');
        this.messageSelect = {
            senderId: true,
            text: true,
            timestamp: true,
            read: true,
            recipientOnline: true,
            chatId: true,
            senderType: true,
            messageImages: true
        };
    }
    insert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newItem = yield _1.default.chat.create({
                    data: data
                });
                return this.repoResponse(false, 201, null, newItem);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    insertChatWithMessage(newChat, newMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newItem = yield _1.default.chat.create({
                    data: {
                        vendorId: newChat.vendorId,
                        productId: newChat.productId,
                        productImageUrl: newChat.productImageUrl,
                        storeLogoUrl: newChat.storeLogoUrl,
                        storeName: newChat.storeName,
                        customerProfilePic: newChat.customerProfilePic,
                        customerId: newChat.customerId,
                        customerName: newChat.customerName,
                        productName: newChat.productName,
                        productPrice: newChat.productPrice,
                        messages: {
                            create: {
                                text: newMessage.text,
                                senderId: newMessage.senderId,
                                recipientOnline: newMessage.recipientOnline,
                                senderType: newMessage.senderType
                            },
                        },
                    },
                    include: {
                        messages: {
                            select: this.messageSelect
                        }
                    }
                });
                return this.repoResponse(false, 201, null, newItem);
            }
            catch (error) {
                console.log(error);
                return this.handleDatabaseError(error);
            }
        });
    }
    getVendorChatsWithMessages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield _1.default.chat.findMany({
                    where: {
                        vendorId: userId
                    },
                    include: {
                        messages: {
                            select: this.messageSelect
                        }
                    }
                });
                return this.repoResponse(false, 200, null, items);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    getCustomerChatsWithMessages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield _1.default.chat.findMany({
                    where: {
                        customerId: userId
                    },
                    include: {
                        messages: {
                            select: this.messageSelect
                        }
                    }
                });
                return this.repoResponse(false, 200, null, items);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    getChatIds(userId, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                [enums_1.UserType.Customer]: { customerId: userId },
                [enums_1.UserType.Vendor]: { vendorId: userId },
                [enums_1.UserType.Admin]: {}
            };
            try {
                const items = yield _1.default.chat.findMany({
                    where: where[userType],
                    select: { id: true }
                });
                return this.repoResponse(false, 200, null, items);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    getChatWithMessages(where) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield _1.default.chat.findFirst({
                    where: where,
                    include: {
                        messages: {
                            select: this.messageSelect
                        }
                    }
                });
                return this.repoResponse(false, 200, null, items);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
}
exports.default = Chat;
