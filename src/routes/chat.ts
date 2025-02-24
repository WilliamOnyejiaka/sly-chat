import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Chat } from "../controllers";

const chat: Router = Router();

chat.get("/:chatId", asyncHandler(Chat.getChat));
chat.delete("/:messageId", asyncHandler(Chat.deleteMessage));
chat.get("/", asyncHandler(Chat.getUserChats));


export default chat;
