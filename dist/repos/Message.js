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
class Message extends Repo_1.default {
    constructor() {
        super('message');
    }
    insert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newItem = yield _1.default.message.create({
                    data: data
                });
                return this.repoResponse(false, 201, null, newItem);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    markMessagesAsRead(chatId, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedMessages = yield _1.default.message.updateMany({
                    where: {
                        chatId: chatId,
                        senderType: { not: userType },
                        read: false,
                    },
                    data: {
                        read: true,
                    },
                });
                return this.repoResponse(false, 201, null, updatedMessages);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    updateOfflineMessages(chatIds, userType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedMessages = yield _1.default.message.updateMany({
                    where: {
                        chatId: { in: chatIds },
                        senderType: { not: userType },
                        recipientOnline: false,
                    },
                    data: {
                        recipientOnline: true,
                    },
                });
                return this.repoResponse(false, 201, null, updatedMessages);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
}
exports.default = Message;
