import { io } from "./socket.js"

// Customer

const sendBtn = document.querySelector("#send-btn");
const displayMsg = document.querySelector("#display-msg");
const msg = document.querySelector("#msg");

// const socket = io('http://localhost:4000/chat', {
//     auth: {
//         token: "jwt"
//     },
// });

const socket = io('https://sly-chat.onrender.com/presence', {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjozfSwidHlwZXMiOlsiY3VzdG9tZXIiXSwiaWF0IjoxNzQwNzY5NzczLCJleHAiOjE3NDMzNjE3NzN9.PoeftTYT1cyymfEgD9GbLmza32K57hPKetc_vqO3Hek"
    },
});

const chat = io('https://sly-chat.onrender.com/chat', {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjozfSwidHlwZXMiOlsiY3VzdG9tZXIiXSwiaWF0IjoxNzQwNzY5NzczLCJleHAiOjE3NDMzNjE3NzN9.PoeftTYT1cyymfEgD9GbLmza32K57hPKetc_vqO3Hek"
    },
});

socket.on('appError', (data) => {
    console.log(data);

});

chat.on('appError', (data) => {
    console.log(data);

});

socket.on('connection', () => {
    console.log("User is online");
});

chat.on('connection', () => {
    console.log("User is online");
});

chat.on('newChat', (data) => {
    console.log(data);
});


chat.on('receiveMessage',(data) => {
    console.log(data);
});

sendBtn.addEventListener("click", async e => {
    const message = {
        "productId": "12345",
        "recipientId": 1,
        "productImageUrl": "https://example.com/product-image.jpg",
        "productPrice": "299.99",
        "text": "Hello",
        "productName": "Wireless Headphones",
        "storeLogoUrl": "https://example.com/store-logo.png",
        "customerProfilePic": "https://example.com/buyer-profile.jpg",
        "customerName": "John Doe",
        "storeName": "Tech Haven",
        "chatIds": "67c210bcc35315bc8e4d5464",
        "messageIds": "67c04c9f108c8c9aa29b1d12"
    };
    socket.emit('sendMessage', message);
});
