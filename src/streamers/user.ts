import { Streamer } from "../utils";
import { streamRouter } from "../config";
import { UserHandler } from "./../handlers/streamers";
import { StreamGroups, StreamEvents } from "../types/enums";

const userStreamer = new Streamer(streamRouter.group(StreamGroups.USER));

userStreamer.on('customer:create', UserHandler.createCustomer().bind(UserHandler));
userStreamer.on('vendor:create', UserHandler.createVendor().bind(UserHandler));
userStreamer.on('admin:create', UserHandler.createAdmin().bind(UserHandler));

userStreamer.on(StreamEvents.UPLOAD_PROFILE_PIC, UserHandler.upload.bind(UserHandler));

export default userStreamer;