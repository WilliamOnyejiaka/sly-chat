import { Streamer } from "../utils";
import { streamRouter } from "../config";
import { ProductHandler } from "./../handlers/streamers";
import { StreamGroups, StreamEvents } from "../types/enums";
import { Server } from "socket.io";


const productStreamer = new Streamer(streamRouter.group(StreamGroups.PRODUCT));

productStreamer.on('product:create', ProductHandler.create.bind(ProductHandler));
// productStreamer.on('vendor:create', UserHandler.createVendor.bind(UserHandler));
// userStreamer.on('admin:create', UserHandler.createAdmin.bind(UserHandler));

// userStreamer.on(StreamEvents.UPLOAD_PROFILE_PIC, UserHandler.upload.bind(UserHandler));

export default productStreamer;