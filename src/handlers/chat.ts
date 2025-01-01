import { Chat } from "../namespaces";
import { ISocket } from "../types";

const chat = new Chat();

chat.register("message", (socket: ISocket) => (data: any) => {
    socket.broadcast.emit('message', data);
});


export default chat;