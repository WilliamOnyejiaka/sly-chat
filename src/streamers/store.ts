import { Streamer } from "../utils";
import { streamRouter } from "../config";
import { UserHandler } from "./../handlers/streamers";
import { StreamGroups, StreamEvents } from "../types/enums";

const storeStreamer = new Streamer(streamRouter.group(StreamGroups.STORE));

storeStreamer.on('customer:create', UserHandler.createCustomer().bind(UserHandler));
storeStreamer.on('vendor:create', UserHandler.createVendor().bind(UserHandler));
storeStreamer.on('admin:create', UserHandler.createAdmin().bind(UserHandler));

storeStreamer.on(StreamEvents.UPLOAD_PROFILE_PIC, UserHandler.upload.bind(UserHandler));

export default storeStreamer;