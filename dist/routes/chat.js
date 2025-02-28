"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const controllers_1 = require("../controllers");
const chat = (0, express_1.Router)();
chat.get("/:chatId", (0, express_async_handler_1.default)(controllers_1.Chat.getChat));
chat.delete("/:messageId", (0, express_async_handler_1.default)(controllers_1.Chat.deleteMessage));
chat.get("/", (0, express_async_handler_1.default)(controllers_1.Chat.getUserChats));
exports.default = chat;
