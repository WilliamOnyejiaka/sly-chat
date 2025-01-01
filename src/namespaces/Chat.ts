import { ISocket } from "../types";
import Base from "./Base";

export default class Chat extends Base {

    public constructor() {
        super();
    }

    protected async onConnection(socket: ISocket) {
        console.log("User connected: ", socket.id);
    }
}