// import { Server } from "socket.io";
// import { ISocket } from "../../types";
// import { Namespaces, UserType } from "../../types/enums";
// import Handler from "./Handler";


// export default class PresenceHandler {
//     // private static readonly facade: any = new PresenceFacade();

//     public static async onConnection(io: Server, socket: ISocket) {
//         const socketId = socket.id;
//         console.log("User connected: ", socketId);
//         const userId = Number(socket.locals.data.id);
//         const userType = socket.locals.userType;
//         console.log(`User id ${userId} , user type ${userType}`);

//         const facadeResult = await PresenceHandler.facade.setOnlineUser(userId, socketId, userType);
//         if (facadeResult.error) {
//             socket.emit('appError', {
//                 error: true,
//                 message: facadeResult.message,
//                 statusCode: 500
//             });
//             socket.disconnect(true);
//             return;
//         }
//         io.of(Namespaces.PRESENCE).emit("userIsOnline", Handler.responseData(200, false, "User is online"));
//     }

//     public static async disconnect(io: Server, socket: ISocket, data: any) {
//         try {

//             const userId = Number(socket.locals.data.id);
//             const userType = socket.locals.userType;
//             const facadeResult = await PresenceHandler.facade.deleteOnlineUser(String(userId), userType);

//             if (facadeResult.error) {
//                 socket.emit('appError', {
//                     error: true,
//                     message: facadeResult.message,
//                     statusCode: 500
//                 });
//                 return;
//             }

//             const chatRoomsResult = await PresenceHandler.facade.getUserTransactionChatRooms(userId, userType);
//             if (chatRoomsResult.error) {
//                 socket.emit('appError', chatRoomsResult);
//                 return;
//             }

//             const chatRooms = chatRoomsResult.data;
//             const rooms = chatRooms ? (chatRooms as Array<any>).map(item => `chat_${item.productId}_${item.vendorId}_${item.customerId}`) : [];

//             console.log('User chat rooms', rooms);

//             if (rooms.length > 0) io.of(Namespaces.CHAT).to(rooms).emit('userIsOffline', Handler.responseData(200, false, "User has gone offline"));
//             console.log(`User disconnected: userId - ${userId} , userType - ${userType} , socketId - ${socket.id}`);
//         } catch (error) {
//             console.error("❌ Error in disconnect:", error);
//             socket.emit("appError", Handler.responseData(500, true, "An internal error occurred"));
//         }

//         // io.of(Namespace.CHAT).sockets.forEach((chatSocket) => {
//         //     if ((chatSocket.handshake.auth.token === socket.handshake.auth.token) || (chatSocket.handshake.headers['token'] === socket.handshake.headers['token'])) {
//         //         console.log(`🔌 [Chat Namespace] Disconnecting user ${chatSocket.id} due to Presence Namespace disconnect`);
//         //         chatSocket.disconnect(true);
//         //     }
//         // });

//         // const chatSockets = io.of(Namespace.CHAT).sockets;

//         // for (const chatSocket of chatSockets.values()) {
//         //     if (
//         //         chatSocket.id !== socket.id && // Ensure we don’t disconnect the current socket twice
//         //         (chatSocket.handshake.auth?.token === socket.handshake.auth?.token ||
//         //             chatSocket.handshake.headers?.['token'] === socket.handshake.headers?.['token'])
//         //     ) {
//         //         console.log(`🔌 [Chat Namespace] Disconnecting socket ${chatSocket.id} due to Presence Namespace disconnect`);
//         //         chatSocket.disconnect(true);
//         //         break;
//         //     }
//         // }

//         // for (const chatSocket of io.of(Namespace.CHAT).sockets.values()) {
//         //     if (
//         //         chatSocket.handshake.auth?.token === socket.handshake.auth?.token ||
//         //         chatSocket.handshake.headers?.['token'] === socket.handshake.headers?.['token']
//         //     ) {
//         //         console.log(`🔌 [Chat Namespace] Disconnecting user ${chatSocket.id} due to Presence Namespace disconnect`);
//         //         chatSocket.disconnect(true);
//         //         break;
//         //     }
//         // }
//     }
// }