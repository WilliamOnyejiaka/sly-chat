import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Notification } from "../controllers";
import { pagination } from "../middlewares/routes/notification";

const notification: Router = Router();

notification.get('/offline', pagination, asyncHandler(Notification.offlineNotifications));
notification.get('/', pagination, asyncHandler(Notification.userNotifications));

export default notification;
