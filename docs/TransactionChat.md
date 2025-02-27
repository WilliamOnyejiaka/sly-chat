# **Socket Events Documentation for Chat System**

This document provides an extensive explanation of all the events supported in the chat system. The system uses **Socket.io** for real-time communication and follows a **namespace-based structure** to manage different types of connections.

## **Overview**

The chat system is designed to facilitate real-time messaging between **customers** and **vendors** in an eCommerce platform.  
Each user can:

## Note if there is an error, the server emits `appError`.

```json
{
  "error": true,
  "message": "The error message",
  "statusCode": 400
}
```

- Connect to the chat server
- Join chat rooms
- Send and receive messages
- Mark messages as read
- Delete messages
- Get chat history
- Indicate when they are typing

---

# **1. Connection Event**

### **Event Name:** `connection`

### **Emitted By:** Server

### **Received By:** Client

### **Description:**

This event is triggered when a user establishes a connection to the **chat namespace**.

### **Flow:**

1. User connects to the chat namespace (`/chat`).
2. The server retrieves the user’s details from the `jwt token` in the `auth` option on the client side.
3. The server checks if the user is already online in the **presence namespace**.
4. If the user is **online**, they are added to the chat namespace, and their offline messages and chats are sent.
5. If the user is **not online**,that means the client side has not yet connected to the (`/presence`) namespace, an error is emitted, and they are disconnected.
6. This event emits `userChats` and `offlineMessages`.

### **Example Response:**

### **Success Response (User Connected)**

#### **userChats emit**

```json
{
  "error": false,
  "message": "Chats have been sent successfully",
  "statusCode": 200,
  "data":[
    {
      id: '67c041dd744c61c167a18a32',
      productId: '12345',
      vendorId: 2,
      customerId: 2,
      productImageUrl: 'https://example.com/product-image.jpg',
      productPrice: 299,
      productName: 'Wireless Headphones',
      storeLogoUrl: 'https://example.com/store-logo.png',
      customerProfilePic: 'https://example.com/buyer-profile.jpg',
      customerName: 'John Doe',
      storeName: 'Tech Haven',
      createdAt: 2025-02-27T10:43:41.905Z,
      updatedAt: 2025-02-27T10:43:41.905Z,
      messages: [ {
                    "senderId": 2,
                    "text": "Are you crazy?",
                    "timestamp": "2025-02-27T10:43:41.905Z",
                    "read": false,
                    "recipientOnline": true,
                    "chatId": "67c041dd744c61c167a18a32",
                    "senderType": "CUSTOMER",
                    "messageImages": []
                }]
    }
  ]
}
```

#### **offlineMessages emit**

```json
{
  "statusCode": 200,
  "error": false,
  "message": "Offline messages has been sent successfully",
  "data": [
    {
      "senderId": 2,
      "text": "Are you crazy?",
      "timestamp": "2025-02-27T10:43:41.905Z",
      "read": false,
      "recipientOnline": true,
      "chatId": "67c041dd744c61c167a18a32",
      "senderType": "CUSTOMER",
      "messageImages": []
    }
  ]
}
```

---

# **2. Join Chat Room**

### **Event Name:** `joinChat`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

A user joins a chat room with another user. This allows them to receive real-time messages for that chat.

### **Payload (From Client):**

```json
{
  "productId": "12345",
  "userType": "customer",
  "text": "Are you crazy?",
  "storeName": "Tech Haven",
  "customerName": "John Doe",
  "storeLogoUrl": "https://example.com/store-logo.png",
  "chatIds": "1770ddc5-429c-4bdf-ae87-249da802d6c0",
  "customerProfilePic": "https://example.com/buyer-profile.jpg",
  "productPrice": "299",
  "productName": "Wireless Headphones",
  "recipientId": 2,
  "productImageUrl": "https://example.com/product-image.jpg"
}
```

### **Server Actions:**

- Fetch the chat from the database.
- Mark previous unread messages as **read**.
- Emit **"loadMessages"** to the user with chat history.
- Notify other users in the room with **"updateReadReceipts"**.

### **Example Response:**

#### **Success Response (Messages Loaded)**

```json
{
  "error": false,
  "message": "Chats have been loaded",
  "statusCode": 200,
  "data": { ...chatDetails }
}
```

#### **Error Response (Chat Not Found)**

```json
{
  "error": true,
  "message": "Chat was not found",
  "statusCode": 404
}
```

---

# **3. Send Message**

### **Event Name:** `sendMessage`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Sends a message to another user. If there is no existing chat, a new one is created.

### **Payload (From Client):**

```json
{
  "productId": "12345",
  "text": "Are you crazy?",
  "storeName": "Tech Haven",
  "customerName": "John Doe",
  "storeLogoUrl": "https://example.com/store-logo.png",
  "chatId": "1770ddc5-429c-4bdf-ae87-249da802d6c0",
  "customerProfilePic": "https://example.com/buyer-profile.jpg",
  "productPrice": "299",
  "productName": "Wireless Headphones",
  "recipientId": 2,
  "productImageUrl": "https://example.com/product-image.jpg"
}
```

### **Server Actions:**

1. If `chatId` does not exist,it creates a new chat.
2. If the recipient is **online**, it emits `newChat`.
3. If the recipient is **offline**, mark the message as **unread**.
4. If `chatId` exists, and the recipient is online ,the server emits `receiveMessage`.

### **Example Response:**

#### **newChat**

```json
{
  "error": false,
  "data": {
    "id": "67c04c9f108c8c9aa29b1d11",
    "productId": "12345",
    "vendorId": 2,
    "customerId": 2,
    "productImageUrl": "https://example.com/product-image.jpg",
    "productPrice": "299.99",
    "productName": "Wireless Headphones",
    "storeLogoUrl": "https://example.com/store-logo.png",
    "customerProfilePic": "https://example.com/buyer-profile.jpg",
    "customerName": "John Doe",
    "storeName": "Tech Haven",
    "createdAt": "2025-02-27T11:29:35.099Z",
    "updatedAt": "2025-02-27T11:29:35.099Z",
    "messages": [
      {
        "senderId": 2,
        "text": "Are you crazy?",
        "timestamp": "2025-02-27T11:29:35.099Z",
        "read": false,
        "recipientOnline": true,
        "chatId": "67c04c9f108c8c9aa29b1d11",
        "senderType": "CUSTOMER",
        "messageImages": []
      }
    ]
  },
  "statusCode": 200
}
```

#### **receiveMessage**

```json
{
  "error": false,
  "data": {
    "error": false,
    "message": null,
    "type": 201,
    "data": {
      "id": "67c0502f6da67b3433a7258a",
      "senderId": 2,
      "senderType": "VENDOR",
      "text": "Hello",
      "timestamp": "2025-02-27T11:44:47.287Z",
      "read": false,
      "recipientOnline": true,
      "chatId": "67c04c9f108c8c9aa29b1d11",
      "createdAt": "2025-02-27T11:44:47.287Z",
      "updatedAt": "2025-02-27T11:44:47.287Z"
    }
  },
  "statusCode": 200
}
```

---

# **4. Receive Message (Real-Time)**

### **Event Name:** `receiveMessage`

### **Emitted By:** Server

### **Received By:** Client

### **Description:**

Triggered when a new message is sent in a chat room.

### **Example Response:**

```json
{
  "error": false,
  "message": "New message received",
  "statusCode": 200,
  "data": { "messageId": "msg-uuid", "text": "Hello!" }
}
```

---

# **5. Mark Messages as Read**

### **Event Name:** `markAsRead`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Marks all messages in a chat as read.

### **Payload (From Client):**

```json
{
  "chatId": "chat-uuid"
}
```

### **Server Actions:**

- Updates all unread messages in the chat as **read**.
- Emits **"updateReadReceipts"** to notify the other user.

### **Example Response:**

#### **Success Response (Messages Marked as Read)**

```json
{
  "error": false,
  "message": "Messages marked as read",
  "statusCode": 200
}
```

---

# **6. Delete Message**

### **Event Name:** `deleteMessage`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Deletes a specific message from a chat.

### **Payload (From Client):**

```json
{
  "chatId": "chat-uuid",
  "messageId": "msg-uuid"
}
```

### **Example Response:**

```json
{
  "error": false,
  "message": "Message has been deleted successfully"
}
```

---

# **7. Typing Indicator**

### **Event Name:** `typing`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Notifies the recipient that the sender is typing.

### **Payload (From Client):**

```json
{
  "chatId": "chat-uuid"
}
```

### **Example Response:**

```json
{
  "error": false,
  "message": "User is typing"
}
```

---

# **8. Get User Chats**

### **Event Name:** `getUserChats`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Fetches all chat conversations for the user.

### **Example Response:**

```json
{
  "error": false,
  "message": "Chats have been sent successfully",
  "data": [ { ...chat1 }, { ...chat2 } ]
}
```

---

# **9. Join Rooms**

### **Event Name:** `joinRooms`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Joins all rooms (chats) associated with the user.

### **Example Response:**

```json
{
  "error": false,
  "message": "User joined all chat rooms"
}
```

---

# **10. Disconnect**

### **Event Name:** `disconnect`

### **Emitted By:** Server

### **Received By:** Client

### **Description:**

Triggered when a user disconnects from the chat namespace.

### **Example Response:**

```json
{
  "error": false,
  "message": "User has gone offline"
}
```

---

## **Conclusion**

This chat system provides real-time messaging features with online status tracking, message persistence, and event-driven communication. Ensure that the client-side is correctly handling all these events for a smooth user experience. 🚀
