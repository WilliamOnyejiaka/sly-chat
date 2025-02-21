import { Chat } from "../namespaces";
import { ISocket } from "../types";
import { Chat as ChatRepo, Message } from "./../repos";

const chat = new Chat();
const chatRepo = new ChatRepo();
const message = new Message();

function responseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
    return {
        statusCode: statusCode,
        json: {
            error: error,
            message: message,
            data: data
        }
    };
}

function handleRepoError(repoResult: any) {
    if (repoResult.error) {
        return responseData(repoResult.type, true, repoResult.message as string);
    }
    return null;
}

chat.register("joinChat", (socket: ISocket) => async (data: any) => {
    const { productId, sellerId, buyerId, userId } = data;

    const room = `chat_${productId}_${sellerId}_${buyerId}`
    console.log(`🟢 User ${userId} joining room: ${room}`)

    try {
        socket.join(room);

        const repoResult = await chatRepo.getAll({ productId, sellerId, buyerId });
        const repoResultError = handleRepoError(repoResult);
        if (repoResultError) socket.emit('appError', repoResultError);
        const chat = repoResult.data;

        if (chat) {
            // console.log(
            //     `📜 Chat found for room ${room}. Messages: ${repoResultlength}`
            // )

            // Mark messages as read if the user is the recipient
            // repoResult.messages.forEach(msg => {
            //     if (msg.senderId !== userId) {
            //         msg.read = true
            //     }
            // });


            // Include the additional fields when sending the chat history
            // socket.emit('loadMessages', {
            //     productImageUrl: repoResult.productImageUrl,
            //     storeLogoUrl: repoResult.storeLogoUrl,
            //     buyerImgUrl: repoResult.buyerImgUrl,
            //     productPrice: repoResult.productPrice,
            //     productName: repoResult.productName,
            //     buyerName: repoResult.buyerName,
            //     storeName: repoResult.storeName,
            //     messages: repoResult.messages
            // })
            socket.to(room).emit('updateReadReceipts', {
                'message': chat
            });
        } else {
            console.log(`⚠️ No chat history found for room ${room}`)
        }
    } catch (error) {
        console.error(`❌ Error joining chat room ${room}:`, error);
        socket.emit('appError', {
            error: true,
            message: "Something went wrong",
            code: 500
        });
    }
});

// chat.register("sendMessage", (socket: ISocket) => async (data: any) => {
//     const {
//         productId,
//         sellerId,
//         buyerId,
//         senderId,
//         text,
//         storeName,
//         buyerName,
//         storeLogoUrl,
//         buyerImgUrl,
//         productPrice,
//         productName,
//         productImageUrl
//     } = data;
//     const room = `chat_${productId}_${sellerId}_${buyerId}`;

//     console.log(
//         `📩 User ${senderId} sending message to room ${room}: "${text}"`
//     )

//     try {
//         let newMessage;

//         const repoResult = await chatRepo.getChatWithMessages({ productId, sellerId, buyerId });
//         const repoResultError = handleRepoError(repoResult);
//         if (repoResultError) socket.emit('appError', repoResultError);
//         const chat = repoResult.data;

//         if (!chat) {
//             console.log(`💬 Creating new chat for room ${room}`);
//             const newChat = {
//                 productId,
//                 sellerId,
//                 buyerId,
//                 buyerImgUrl,
//                 productPrice,
//                 productName,
//                 storeName,
//                 buyerName,
//                 storeLogoUrl,
//                 productImageUrl,
//             }

//             const newChatResult = await chatRepo.insertChatWithMessage(newChat, newMessage);
//             const newChatResultError = handleRepoError(newChatResult);
//             if (newChatResultError) socket.emit('appError', repoResultError);
//             newMessage = newChatResult.data.messages[0];
//         } else {
//             console.log(`🟡 Adding message to existing chat for room ${room}`);
//             const createMessageResult = await message.insert(newMessage);
//             const createMessageResultError = handleRepoError(createMessageResult);
//             if (createMessageResultError) socket.emit('appError', createMessageResultError);
//         }

//         // Mark all existing messages as read except for the current sender's message
//         const markMessagesAsReadResult = await message.markMessagesAsRead(chat.id, senderId);
//         const markMessagesAsReadResultError = handleRepoError(markMessagesAsReadResult);
//         if (markMessagesAsReadResultError) socket.emit('appError', markMessagesAsReadResultError);

//         socket.to(room).emit('receiveMessage', newMessage)
//         console.log(`✅ Message sent successfully to room ${room}`)
//     } catch (error) {
//         console.error(`❌ Error sending message in room ${room}:`, error);

//         socket.emit('appError', {
//             error: true,
//             message: "Something went wrong",
//             code: 500
//         });
//     }
// });


chat.register("sendMessage", (socket: ISocket) => async (data: any) => {
    console.log(data);

    const {
        productId,
        sellerId,
        buyerId,
        senderId,
        text,
        storeName,
        buyerName,
        storeLogoUrl,
        buyerImgUrl,
        productPrice,
        productName,
        productImageUrl
    } = data;

    const room = `chat_${productId}_${sellerId}_${buyerId}`;

    console.log(`📩 User ${senderId} sending message to room ${room}: "${text}"`);

    try {
        const repoResult = await chatRepo.getChatWithMessages({ productId, sellerId, buyerId });
        const repoResultError = handleRepoError(repoResult);
        if (repoResultError) return socket.emit('appError', repoResultError);

        let chat = repoResult.data;

        let newMessage;

        if (chat) {
            console.log(`💬 Creating new chat for room ${room}`);

            const newChat = {
                productId,
                sellerId,
                buyerId,
                buyerImgUrl,
                productPrice,
                productName,
                storeName,
                buyerName,
                storeLogoUrl,
                productImageUrl,
            };

            // Create new chat with first message
            const newChatResult = await chatRepo.insertChatWithMessage(newChat, { senderId, text });
            const newChatResultError = handleRepoError(newChatResult);
            console.log(newChatResultError);
            
            if (newChatResultError) return socket.emit('appError', newChatResultError);

            chat = newChatResult.data; // Get the newly created chat

            newMessage = chat.messages[0]; // First message in the chat
            console.log(newMessage);

        } else {
            console.log(`🟡 Adding message to existing chat for room ${room}`);

            newMessage = await message.insert({ senderId, text, chatId: chat.id });
            const createMessageResultError = handleRepoError(newMessage);
            if (createMessageResultError) return socket.emit('appError', createMessageResultError);
        }

        // Mark all existing messages as read except for the sender's own messages
        const markMessagesAsReadResult = await message.markMessagesAsRead(chat.id, senderId);
        const markMessagesAsReadResultError = handleRepoError(markMessagesAsReadResult);
        if (markMessagesAsReadResultError) return socket.emit('appError', markMessagesAsReadResultError);

        // Emit new message event to the room
        socket.to(room).emit('receiveMessage', newMessage);
        console.log(`✅ Message sent successfully to room ${room}`);
    } catch (error) {
        console.error(`❌ Error sending message in room ${room}:`, error);

        socket.emit('appError', {
            error: true,
            message: "Something went wrong",
            code: 500
        });
    }
});

chat.register("testing", (socket: ISocket) => (data: any) => {
    socket.broadcast.emit('message', data);
});


export default chat;