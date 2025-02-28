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
class PresenceHandler {
    static onConnection(io, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            const socketId = socket.id;
            console.log("User connected: ", socketId);
            const userId = Number(socket.locals.data.id);
            const userType = socket.locals.userType;
            console.log(`User id ${userId} , user type ${userType}`);
            const facadeResult = yield PresenceHandler.facade.setOnlineUser(userId, socketId, userType);
            if (facadeResult.error) {
                socket.emit('appError', {
                    error: true,
                    message: facadeResult.message,
                    statusCode: 500
                });
                socket.disconnect(true);
                return;
            }
            io.of(enums_1.Namespace.PRESENCE).emit("userIsOnline", Handler_1.default.responseData(200, false, "User is online"));
        });
    }
    static disconnect(io, socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = Number(socket.locals.data.id);
                const userType = socket.locals.userType;
                const facadeResult = yield PresenceHandler.facade.deleteOnlineUser(String(userId), userType);
                if (facadeResult.error) {
                    socket.emit('appError', {
                        error: true,
                        message: facadeResult.message,
                        statusCode: 500
                    });
                    return;
                }
                const chatRoomsResult = yield PresenceHandler.facade.getUserTransactionChatRooms(userId, userType);
                if (chatRoomsResult.error) {
                    socket.emit('appError', chatRoomsResult);
                    return;
                }
                const chatRooms = chatRoomsResult.data;
                const rooms = chatRooms ? chatRooms.map(item => item.id) : [];
                console.log('User chat rooms', rooms);
                if (rooms.length > 0)
                    io.of(enums_1.Namespace.CHAT).to(rooms).emit('userIsOffline', Handler_1.default.responseData(200, false, "User has gone offline"));
                console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
            }
            catch (error) {
                console.error("❌ Error in disconnect:", error);
                socket.emit("appError", Handler_1.default.responseData(500, true, "An internal error occurred"));
            }
        });
    }
}
PresenceHandler.facade = new facade_1.PresenceFacade();
exports.default = PresenceHandler;
