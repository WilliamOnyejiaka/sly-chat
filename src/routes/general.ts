import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { General } from "../controllers";

const general = Router();

general.get("/docs",General.docs);
general.get("/clear-chats",General.clearChatTbl);

export default general;