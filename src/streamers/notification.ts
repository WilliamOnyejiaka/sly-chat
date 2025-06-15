import { Streamer } from "../utils";
import { streamRouter } from "../config";
import { NotificationHandler } from "./../handlers/streamers";
import { StreamGroups, StreamEvents } from "../types/enums";
import { Server } from "socket.io";


const notificationStreamer = new Streamer(streamRouter.group(StreamGroups.NOTIFICATION));

notificationStreamer.on('notification:users', NotificationHandler.notify.bind(NotificationHandler));
// productStreamer.on('vendor:create', UserHandler.createVendor.bind(UserHandler));
// userStreamer.on('admin:create', UserHandler.createAdmin.bind(UserHandler));

// userStreamer.on(StreamEvents.UPLOAD_PROFILE_PIC, UserHandler.upload.bind(UserHandler));

export default notificationStreamer;