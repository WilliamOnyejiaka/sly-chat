import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Chat } from "../controllers";
import { uploads } from "../middlewares";

const chat: Router = Router();

chat.post('/send-pdf', uploads.any(), asyncHandler(Chat.sendPdf));

chat.get("/:chatId", asyncHandler(Chat.getChat));
chat.delete("/:messageId", asyncHandler(Chat.deleteMessage));
chat.get("/", asyncHandler(Chat.getUserChats));




export default chat;
