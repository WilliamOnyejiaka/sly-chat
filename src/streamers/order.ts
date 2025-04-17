import { Streamer } from "../utils";
import { streamRouter } from "../config";

const orderStreamer = new Streamer(streamRouter.group('test'));

orderStreamer.on('Jest', async (event, stream, id, io) => {
    console.log(event);
});

orderStreamer.on('update', async (event, stream, id, io) => {
    console.log(event);
});

export default orderStreamer;