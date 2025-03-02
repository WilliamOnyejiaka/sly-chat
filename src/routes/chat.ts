import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Chat } from "../controllers";
import { uploads } from "../middlewares";
import { ResourceType } from "../types/enums";

const chat: Router = Router();

chat.post('/send-pdf', uploads(ResourceType.PDF).any(), asyncHandler(Chat.sendPdf));
chat.post('/send-image', uploads(ResourceType.IMAGE).any(), asyncHandler(Chat.sendImage));
chat.post('/send-video', uploads(ResourceType.VIDEO).any(), asyncHandler(Chat.sendVideo));
chat.get("/:chatId", asyncHandler(Chat.getChat));
chat.delete("/:messageId", asyncHandler(Chat.deleteMessage));
chat.get("/", asyncHandler(Chat.getUserChats));

export default chat;
