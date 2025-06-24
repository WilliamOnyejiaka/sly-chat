import { SupportChat } from "../namespaces";
import { ChatHandler } from "../handlers/sockets";

const supportChat = new SupportChat();

supportChat.onConnection(ChatHandler.onConnection.bind(ChatHandler));
supportChat.register("joinChat", ChatHandler.joinChat.bind(ChatHandler));
supportChat.register("sendMessage", ChatHandler.sendMessage.bind(ChatHandler));
supportChat.register("markAsRead", ChatHandler.markAsRead.bind(ChatHandler));
supportChat.register("deleteMessage", ChatHandler.deleteMessage.bind(ChatHandler));
supportChat.register("typing", ChatHandler.typing.bind(ChatHandler));
supportChat.register("stoppedTyping", ChatHandler.stoppedTyping.bind(ChatHandler));
// supportChat.register("getUserChats", ChatHandler.getUserChats.bind(ChatHandler));
// supportChat.register("joinRooms", ChatHandler.joinRooms.bind(ChatHandler));
supportChat.register("disconnect", ChatHandler.disconnect.bind(ChatHandler));

export default supportChat;