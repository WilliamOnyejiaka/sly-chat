import Base from "./Base";

export default class Chat extends Base {

    public constructor() {
        super();
    }

    // protected async onConnection(socket: ISocket) {
    // console.log("User connected: ", socket.id);
    // const userId = String(socket.locals.data.id);
    // const userType = socket.locals.userType;
    // console.log(`User id ${userId} , user type ${userType}`);

    // if (userType == UserType.Customer) {
    //     const onlineCache = await Chat.onlineCustomer.get(userId);
    //     const onlineData = onlineCache.data;
    //     if (onlineData) {
    //         const socketId = JSON.parse(onlineData).socketId
    //         const successful = await Chat.onlineCustomer.set(userId, {
    //             chatSocketId: socket.id,
    //             socketId,
    //         });
    //         if (!successful) {
    //             socket.emit('appError', {
    //                 error: true,
    //                 message: "Something went wrong",
    //                 statusCode: 500
    //             });
    //             return;
    //         }
    //     } else {
    //         socket.emit('appError', {
    //             error: true,
    //             message: "Connect to presence namespace first",
    //             statusCode: 400
    //         });
    //         socket.disconnect();
    //     }

    // } else if (userType == UserType.Vendor) {
    //     const onlineCache = await Chat.onlineVendor.get(userId);
    //     const onlineData = onlineCache.data;
    //     if (onlineData) {
    //         const socketId = JSON.parse(onlineData).socketId
    //         const successful = await Chat.onlineVendor.set(userId, {
    //             chatSocketId: socket.id,
    //             socketId,
    //         });
    //         if (!successful) {
    //             socket.emit('appError', {
    //                 error: true,
    //                 message: "Something went wrong",
    //                 statusCode: 500
    //             });
    //             return;
    //         }
    //     } else {
    //         socket.emit('appError', {
    //             error: true,
    //             message: "Connect to presence namespace first",
    //             statusCode: 400
    //         });
    //         socket.disconnect();
    //     }

    // } else {
    //     socket.emit('appError', {
    //         error: true,
    //         message: "Invalid user type",
    //         statusCode: 401
    //     });
    //     socket.disconnect();
    //     return;
    // }

    // const message = "Chats has been sent successfully";

    // const repoResult = userType == UserType.Customer ? await Chat.chatRepo.getBuyerChatsWithMessages(userId) : await Chat.chatRepo.getSellerChatsWithMessages(userId);
    // const repoResultError = Handler.handleRepoError(repoResult);
    // if (repoResultError) {
    //     socket.emit('appError', repoResultError);
    //     return;
    // }
    // const chat = repoResult.data;
    // const rooms = chat.map((item: any) => item.publicId);
    // let offlineMessages = chat.flatMap((item: any) => item.messages.filter((message: any) => message.recipientOnline === false));

    // const chatIds = offlineMessages.map((item: any) => item.chatId);

    // const updateOfflineMessagesRepoResult = await Chat.messageRepo.updateOfflineMessages(chatIds, userId, userType);
    // const updateOfflineMessagesRepoResultError = Handler.handleRepoError(updateOfflineMessagesRepoResult);
    // if (updateOfflineMessagesRepoResultError) {
    //     socket.emit('appError', updateOfflineMessagesRepoResultError);
    //     return;
    // }

    // offlineMessages = offlineMessages.map((item: any) => {
    //     item.recipientOnline = true;
    //     return item;
    // });

    // if (rooms.length > 0) {
    //     socket.join(rooms);
    //     socket.to(rooms).emit("userIsOnline", Handler.responseData(200, false, "User is online"));
    // }
    // socket.emit('offlineMessages', Handler.responseData(200, false, "Offline messages has been sent successfully", offlineMessages));
    // socket.emit('userChats', Handler.responseData(200, false, message, repoResult.data));
    // return;
    // }
}