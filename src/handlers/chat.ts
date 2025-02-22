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

        const repoResult = await chatRepo.getChatWithMessages({ productId, sellerId, buyerId });
        const repoResultError = handleRepoError(repoResult);
        if (repoResultError) socket.emit('appError', repoResultError);
        const chat = repoResult.data;

        if (chat) {

            const messages = chat.messages;
            if (messages.length != 0) {
                const notSenderId = messages[0].senderId == sellerId ? buyerId : sellerId;

                // Mark messages as read if the user is the recipient
                const markMessagesAsReadResult = await message.markMessagesAsRead(chat.id, notSenderId);
                const markMessagesAsReadResultError = handleRepoError(markMessagesAsReadResult);
                if (markMessagesAsReadResultError) return socket.emit('appError', markMessagesAsReadResultError);

                //Include the additional fields when sending the chat history
                socket.emit('loadMessages', {
                    productImageUrl: chat.productImageUrl,
                    storeLogoUrl: chat.storeLogoUrl,
                    buyerImgUrl: chat.buyerImgUrl,
                    productPrice: chat.productPrice,
                    productName: chat.productName,
                    buyerName: chat.buyerName,
                    storeName: chat.storeName,
                    messages: chat.messages
                });
                socket.to(room).emit('updateReadReceipts', {
                    'message': chat
                });
            }
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

        if (!chat) {
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
        socket.to(room).emit('receiveMessage', {
            error: false,
            data: newMessage,
            statusCode: 200
        });
        console.log(`✅ Message sent successfully to room ${room}`);
    } catch (error) {
        console.error(`❌ Error sending message in room ${room}:`, error);

        socket.emit('appError', {
            error: true,
            message: "Something went wrong",
            statusCode: 500
        });
    }
});

chat.register("markAsRead", (socket: ISocket) => async (data: any) => {
    const { productId, sellerId, buyerId, userId } = data;
    const room = `chat_${productId}_${sellerId}_${buyerId}`
    console.log(
        `👀 User ${userId} marking messages as read in room ${room}`
    )

    const repoResult = await chatRepo.getChatWithMessages({ productId, sellerId, buyerId });
    const repoResultError = handleRepoError(repoResult);
    if (repoResultError) socket.emit('appError', repoResultError);
    const chat = repoResult.data;

    if (chat) {
        const messages = chat.messages;
        if (messages.length != 0) {
            const notSenderId = messages[0].senderId == sellerId ? buyerId : sellerId;
            // Mark messages as read if the user is the recipient
            const markMessagesAsReadResult = await message.markMessagesAsRead(chat.id, notSenderId);
            const markMessagesAsReadResultError = handleRepoError(markMessagesAsReadResult);
            if (markMessagesAsReadResultError) return socket.emit('appError', markMessagesAsReadResultError);
            socket.to(room).emit('updateReadReceipts', chat.messages)
            console.log(`✅ Messages marked as read in room ${room}`)
        }
    } else {
        console.log(`⚠️ No chat found for room ${room} to mark as read`)
    }
});

chat.register("deleteMessage", (socket: ISocket) => async (data: any) => {
    const { productId, sellerId, buyerId, messageId } = data;
    const room = `chat_${productId}_${sellerId}_${buyerId}`;
    console.log(`🗑️ Deleting message ${messageId} in room ${room}`)

    const repoResult = await message.deleteWithId(messageId);
    const repoResultError = handleRepoError(repoResult);
    if (repoResultError) socket.emit('appError', repoResultError);
    socket.to(room).emit('messageDeleted', messageId);// Emit message deletion event
    console.log(
        `✅ Message ${messageId} deleted successfully from room ${room}`
    );
});

chat.register("typing", (socket: ISocket) => async (data: any) => {
    const { productId, sellerId, buyerId, senderId } = data;

    const room = `chat_${productId}_${sellerId}_${buyerId}`
    console.log(`✍️ User ${senderId} is typing in room ${room}`)
    socket.to(room).emit('userTyping', senderId)
});



chat.register("disconnect", (socket: ISocket) => (data: any) => {
    console.log("User disconnected: ", socket.id);
});

chat.register("testing", (socket: ISocket) => (data: any) => {
    socket.broadcast.emit('message', data);
});


export default chat;