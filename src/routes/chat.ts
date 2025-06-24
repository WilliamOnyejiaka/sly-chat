import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Chat } from "../controllers";
import { getChat, sendImage, sendPdf, sendVideo, messages, recentMessages, pagination } from "../middlewares/routes/chat";

const chat: Router = Router();

chat.post('/send-pdf', sendPdf, asyncHandler(Chat.sendPdf()));
chat.post('/send-image', sendImage, asyncHandler(Chat.sendImage()));
chat.post('/send-video', sendVideo, asyncHandler(Chat.sendVideo()));
chat.get("/unread", pagination, asyncHandler(Chat.unreadChats));

chat.get("/messages/recent/:productId/:participantId", recentMessages, asyncHandler(Chat.recentMessages));
chat.get("/messages/:productId/:participantId", messages, asyncHandler(Chat.messages));
chat.delete("/message/:messageId", asyncHandler(Chat.deleteMessage));

chat.get("/:productId/:participantId", getChat, asyncHandler(Chat.getChat));
chat.delete("/:id", asyncHandler(Chat.deleteChat));
chat.get("/", pagination, asyncHandler(Chat.getUserChats));

export default chat;
