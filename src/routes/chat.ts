import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Chat } from "../controllers";
import { getChat, sendImage, sendPdf, sendVideo } from "../middlewares/routes/chat";

const chat: Router = Router();

chat.post('/send-pdf', sendPdf, asyncHandler(Chat.sendPdf()));
chat.post('/send-image', sendImage, asyncHandler(Chat.sendImage()));
chat.post('/send-video', sendVideo, asyncHandler(Chat.sendVideo()));

chat.get("/:productId/:vendorId/:customerId", getChat, asyncHandler(Chat.getChat));
chat.delete("/message/:messageId", asyncHandler(Chat.deleteMessage));
chat.delete("/:id", asyncHandler(Chat.deleteChat));
chat.get("/", asyncHandler(Chat.getUserChats));

export default chat;
