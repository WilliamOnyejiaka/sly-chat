import { Streamer } from "../utils";
import { streamRouter } from "../config";
import { StoreHandler } from "./../handlers/streamers";
import { StreamGroups, StreamEvents } from "../types/enums";

const storeStreamer = new Streamer(streamRouter.group(StreamGroups.STORE));

storeStreamer.on(StreamEvents.STORE_CREATE, StoreHandler.create.bind(StoreHandler));
storeStreamer.on(StreamEvents.DELETE, StoreHandler.delete.bind(StoreHandler));
storeStreamer.on(StreamEvents.UPLOAD, StoreHandler.upload.bind(StoreHandler));


export default storeStreamer;