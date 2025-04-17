import { Streamer } from "../utils";
import { streamRouter } from "../config";

const userBluePrint = new Streamer(streamRouter.group('user'));

userBluePrint.on('vendor-signup', async (event, stream, id, io) => {
    console.log(event);
});

export default userBluePrint;