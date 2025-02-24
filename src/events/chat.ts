import { Chat } from "../namespaces";
import { ChatHandler } from "../handlers";
import { ISocket } from "../types";

const chat = new Chat();

chat.register("joinChat", ChatHandler.joinChat.bind(ChatHandler));
chat.register("sendMessage", ChatHandler.sendMessage.bind(ChatHandler));
chat.register("markAsRead", ChatHandler.markAsRead.bind(ChatHandler));
chat.register("deleteMessage", ChatHandler.deleteMessage.bind(ChatHandler));
chat.register("typing", ChatHandler.typing.bind(ChatHandler));
chat.register("getUserChats", ChatHandler.getUserChats.bind(ChatHandler));
chat.register("joinRooms", ChatHandler.joinRooms.bind(ChatHandler));
chat.register("disconnect", ChatHandler.disconnect.bind(ChatHandler));

chat.register("testing", (socket: ISocket) => (data: any) => {
    socket.broadcast.emit('message', data);
});


export default chat;