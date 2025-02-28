"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../types/enums");
const Handler_1 = __importDefault(require("./Handler"));
const facade_1 = require("../facade");
const enums_2 = require("./../types/enums");
class ChatHandler {
    static onConnection(io, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("User connected: ", socket.id);
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;
            console.log(`User id ${userId} , user type ${userType}`);
            const onlineCacheUpdated = yield ChatHandler.facade.updateOnlineCache(String(userId), userType, socket);
            if (onlineCacheUpdated.error) {
                socket.emit('appError', onlineCacheUpdated);
                socket.disconnect(true);
                return;
            }
            const getUserChatsAndOfflineMessages = yield ChatHandler.facade.getUserChatsAndOfflineMessages(userId, userType);
            if (getUserChatsAndOfflineMessages.error) {
                socket.emit('appError', getUserChatsAndOfflineMessages);
                return;
            }
            console.log("✅ User offline messages has been retrieved");
            const rooms = getUserChatsAndOfflineMessages.data.rooms;
            const offlineMessages = getUserChatsAndOfflineMessages.data.offlineMessages;
            const chat = getUserChatsAndOfflineMessages.data.chat;
            console.log("🚧 Joining rooms...");
            if (rooms)
                socket.join(rooms);
            console.log("✅ Rooms has been joint");
            io.of(enums_1.Namespace.CHAT).to(rooms).emit("userIsOnline", Handler_1.default.responseData(200, false, "User is online"));
            socket.emit('offlineMessages', Handler_1.default.responseData(200, false, "Offline messages has been sent successfully", offlineMessages));
            socket.emit('userChats', Handler_1.default.responseData(200, false, "Chats have been sent successfully", chat));
        });
    }
    static joinRooms(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = socket.locals.data.id;
            const userType = socket.locals.userType;
            const facadeResult = yield ChatHandler.facade.socketGetUserChats(Number(userId), userType);
            if (facadeResult.error) {
                socket.emit('appError', facadeResult);
                return;
            }
            const chats = facadeResult.data;
            const rooms = chats.map((item) => item.id);
            if (rooms.length > 0)
                socket.join(rooms);
            socket.emit('userChats', Handler_1.default.responseData(200, false, "Chats has been sent successfully", chats));
        });
    }
    static joinChat(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = socket.locals.data.id;
            const userType = socket.locals.userType;
            const senderType = userType.toUpperCase();
            const { chatId } = data;
            if (!chatId) {
                socket.emit('appError', Handler_1.default.responseData(400, true, "Chat Id is required"));
                return;
            }
            console.log(`🟢 User ${userId} joining room: ${chatId}`);
            const chatResult = yield ChatHandler.facade.socketGetChat(chatId);
            if (chatResult.error) {
                socket.emit('appError', chatResult);
                return;
            }
            const chat = chatResult.data;
            if (chat) {
                socket.join(chatId);
                const messages = chat.messages;
                if (messages.length > 0) {
                    // Mark messages as read if the user is the recipient
                    const markMessagesAsReadResult = yield ChatHandler.facade.socketMarkMessagesAsRead(chat.id, senderType);
                    if (markMessagesAsReadResult.error) {
                        socket.emit('appError', markMessagesAsReadResult);
                        return;
                    }
                    chat.messages = messages.map((item) => {
                        if (item.senderType !== senderType)
                            item.read = true;
                        return item;
                    });
                    //Include the additional fields when sending the chat history
                    socket.emit('loadMessages', Handler_1.default.responseData(200, false, "Chats has been loaded", chat));
                    // socket.to(chatId).emit('updateReadReceipts', Handler.responseData(200, false, "Chats has been updated"));
                    return;
                }
            }
        });
    }
    static sendMessage(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;
            const senderType = userType.toUpperCase();
            let { recipientId, productId, chatId, text, storeName, customerName, storeLogoUrl, customerProfilePic, productPrice, productName, productImageUrl } = data;
            if (!recipientId || !text) {
                socket.emit('appError', Handler_1.default.responseData(400, true, "Invalid data provided"));
                return;
            }
            let customerId, vendorId;
            if (userType == enums_1.UserType.Customer) {
                vendorId = recipientId;
                customerId = userId;
            }
            else if (userType == enums_1.UserType.Vendor) {
                customerId = recipientId;
                vendorId = userId;
            }
            else {
                socket.emit('appError', {
                    error: true,
                    message: "Unauthorized user",
                    statusCode: 401
                });
                return;
            }
            const statusResult = yield ChatHandler.facade.getRecipientOnlineStatus(userType, recipientId);
            if (statusResult.error) {
                socket.emit('appError', statusResult);
                return;
            }
            const recipientOnlineData = statusResult.data;
            const recipientOnline = !!recipientOnlineData;
            let chat;
            if (!chatId) {
                console.log(`💬 Creating new chat for room `);
                const newChat = {
                    productId: productId,
                    vendorId,
                    customerId,
                    customerProfilePic,
                    productPrice,
                    productName,
                    storeName,
                    customerName,
                    storeLogoUrl,
                    productImageUrl,
                };
                const newMessage = { senderId: userId, text, recipientOnline, senderType };
                // Create new chat with first message
                const newChatResult = yield ChatHandler.facade.createChatWithMessage(newChat, newMessage);
                if (newChatResult.error) {
                    socket.emit('appError', newChatResult);
                    return;
                }
                chat = newChatResult.data; // Get the newly created chat
                chatId = chat.id;
                console.log(chatId);
                socket.join(chatId);
                console.log(`✅ New chat has been created`);
                io.of(enums_1.Namespace.CHAT).to(socket.id).emit('sentMessage', Handler_1.default.responseData(200, false, null, chat.messages));
                if (recipientOnlineData) {
                    const recipientSocketId = recipientOnlineData.chatSocketId;
                    (_a = io.sockets.sockets.get(recipientSocketId)) === null || _a === void 0 ? void 0 : _a.join(chatId); //💬 Forcing the the recipient to join the room 
                    socket.to(recipientSocketId).emit('newChat', Handler_1.default.responseData(200, false, chat));
                    console.log(`✅ Message sent directly to user ${recipientId} via socket ${recipientSocketId}`);
                    return;
                }
            }
            else {
                console.log(`📩 User ${userId} sending message to room ${chatId}: "${text}"`);
                const chatResult = yield ChatHandler.facade.socketGetChat(chatId);
                if (chatResult.error) {
                    socket.emit('appError', chatResult);
                    return;
                }
                console.log(`🟡 Adding message to existing chat for room ${chatId}`);
                chat = chatResult.data;
                if (chat) {
                    const newMessageResult = yield ChatHandler.facade.socketCreateMessage(userId, text, chatId, recipientOnline, senderType);
                    if (newMessageResult.error) {
                        socket.emit('appError', newMessageResult);
                        return;
                    }
                    // Mark all existing messages as read except for the sender's own messages
                    const markMessagesAsReadResult = yield ChatHandler.facade.socketMarkMessagesAsRead(chat.id, senderType);
                    if (markMessagesAsReadResult.error) {
                        socket.emit('appError', markMessagesAsReadResult);
                        return;
                    }
                    // Emit new message event to the room
                    // io.of(Namespace.CHAT).to(chatId).emit('receiveMessage', Handler.responseData(200, false, null, newMessage));
                    const newMessage = newMessageResult.data;
                    if (recipientOnline)
                        socket.to(chatId).emit('receiveMessage', Handler_1.default.responseData(200, false, null, newMessage));
                    io.of(enums_1.Namespace.CHAT).to(socket.id).emit('sentMessage', Handler_1.default.responseData(200, false, null, newMessage));
                    console.log(`✅ Message sent successfully to room ${chatId}`);
                    return;
                }
                else {
                    socket.emit('appError', Handler_1.default.responseData(404, true, "Chat was not found"));
                    return;
                }
            }
        });
    }
    static markAsRead(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;
            const { chatId } = data;
            console.log(`👀 User ${userId} marking messages as read in room ${chatId}`);
            const facadeResult = yield ChatHandler.facade.socketGetUserChats(userId, userType);
            if (facadeResult.error) {
                socket.emit('appError', facadeResult);
                return;
            }
            const chat = facadeResult.data;
            if (chat) {
                const messages = chat.messages;
                if (messages.length != 0) {
                    const markMessagesAsReadResult = yield ChatHandler.facade.socketMarkMessagesAsRead(chatId, userType);
                    if (markMessagesAsReadResult.error) {
                        socket.emit('appError', markMessagesAsReadResult);
                        return;
                    }
                    socket.to(chatId).emit('updateReadReceipts', chat.messages);
                    console.log(`✅ Messages marked as read in room ${chatId}`);
                }
            }
            else {
                console.log(`⚠️ No chat found for room ${chatId} to mark as read`);
            }
        });
    }
    static deleteMessage(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { chatId, messageId } = data;
            console.log(`🗑️ Deleting message ${messageId} in room ${chatId}`);
            const facadeResult = yield ChatHandler.facade.socketDeleteMessage(messageId);
            if (facadeResult.error) {
                socket.emit(enums_2.Events.APP_ERROR, facadeResult);
                return;
            }
            io.of(enums_1.Namespace.CHAT).to(chatId).emit('messageDeleted', Handler_1.default.responseData(200, false, "Message has been deleted successfully"));
            console.log(`✅ Message ${messageId} deleted successfully from room ${chatId}`);
        });
    }
    static typing(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = String(socket.locals.data.id);
            const userType = socket.locals.userType;
            const { chatId } = data;
            console.log(`✍️ User ${userId} is typing in room ${chatId}`);
            socket.to(chatId).emit('userTyping', Handler_1.default.responseData(200, false, "User is typing"));
        });
    }
    static stoppedTyping(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(socket.locals.data.id);
            const { chatId } = data;
            console.log(`✍️ User ${userId} is typing in room ${chatId}`);
            socket.to(chatId).emit('stoppedTyping', Handler_1.default.responseData(200, false, "User has stopped typing"));
        });
    }
    static getUserChats(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;
            const message = "Chats has been sent successfully";
            const facadeResult = yield ChatHandler.facade.socketGetUserChats(userId, userType);
            if (facadeResult.error) {
                socket.emit('appError', facadeResult);
                return;
            }
            socket.emit('userChats', Handler_1.default.responseData(200, false, message, facadeResult.data));
        });
    }
    static editMessage(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    static disconnect(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = Number(socket.locals.data.id);
                const userType = socket.locals.userType;
                const facadeResult = yield ChatHandler.facade.socketGetUserChats(userId, userType);
                if (facadeResult.error) {
                    socket.emit('appError', facadeResult);
                    return;
                }
                const chat = facadeResult.data;
                const rooms = chat.map((item) => item.id);
                if (rooms.length > 0) {
                    socket.leave(rooms);
                    socket.to(rooms).emit('userIsOffline', Handler_1.default.responseData(200, false, "User has gone offline"));
                }
                console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
            }
            catch (error) {
                console.error("❌ Error in disconnect:", error);
                socket.emit("appError", Handler_1.default.responseData(500, true, "An internal error occurred"));
            }
        });
    }
}
ChatHandler.facade = new facade_1.ChatManagementFacade();
exports.default = ChatHandler;
