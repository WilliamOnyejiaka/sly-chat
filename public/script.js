import { io } from "./socket.js"

const sendBtn = document.querySelector("#send-btn");
const displayMsg = document.querySelector("#display-msg");
const msg = document.querySelector("#msg");

const socket = io('http://localhost:3000/chat', {
    auth: {
        userId: 2
    }
});

socket.on('connect_error', (data) => {
    console.log(data);

});

socket.on('connection', () => {
    console.log("User is online");
});

socket.on('message', (data) => {
    displayMsg.innerHTML = data;
});

sendBtn.addEventListener("click", async e => {
    socket.emit('message', msg.value);
});
