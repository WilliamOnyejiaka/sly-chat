# **Socket Events Documentation for Chat System**

This document provides an extensive explanation of all the events supported in the chat system. The system uses **Socket.io** for real-time communication and follows a **namespace-based structure** to manage different types of connections.

## **Production Url**
https://sly-chat.onrender.com

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
  "chatId": "67c04c9f108c8c9aa29b1d11"
}
```

### **Server Actions:**

- Fetch the chat from the database.
- Mark previous unread messages as **read**.
- Emit **"loadMessages"** to the user with chat history.

### **Example Response:**

#### **loadMessages emit**

```json
{
  "statusCode": 200,
  "error": false,
  "message": "Chats has been loaded",
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
        "read": true,
        "recipientOnline": true,
        "chatId": "67c04c9f108c8c9aa29b1d11",
        "senderType": "CUSTOMER",
        "messageImages": []
      },
      {
        "senderId": 2,
        "text": "Are you crazy?",
        "timestamp": "2025-02-27T11:41:34.161Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c04c9f108c8c9aa29b1d11",
        "senderType": "VENDOR",
        "messageImages": []
      },
      {
        "senderId": 2,
        "text": "Are you crazy?",
        "timestamp": "2025-02-27T11:42:17.134Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c04c9f108c8c9aa29b1d11",
        "senderType": "CUSTOMER",
        "messageImages": []
      },
      {
        "senderId": 2,
        "text": "Hello",
        "timestamp": "2025-02-27T11:44:47.287Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c04c9f108c8c9aa29b1d11",
        "senderType": "VENDOR",
        "messageImages": []
      },
      {
        "senderId": 2,
        "text": "Hello",
        "timestamp": "2025-02-27T12:38:36.425Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c04c9f108c8c9aa29b1d11",
        "senderType": "VENDOR",
        "messageImages": []
      }
    ]
  }
}
```

---

# **3. Join Rooms**

### **Event Name:** `joinRooms`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Make the user to join every room that the user is in. This allows them to receive real-time messages for all the chats that they are in.

1. No payload required
2. Emits `"userChats"`, which sends all the user chats and messages to the client.

### **Example Response:**

#### **userChats**

```json
{
  "statusCode": 200,
  "error": false,
  "message": "Chats has been sent successfully",
  "data": [
    {
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
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "CUSTOMER",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Are you crazy?",
          "timestamp": "2025-02-27T11:41:34.161Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Are you crazy?",
          "timestamp": "2025-02-27T11:42:17.134Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "CUSTOMER",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T11:44:47.287Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T12:38:36.425Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c05ca677b0838ae7417fe8",
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
      "createdAt": "2025-02-27T12:37:58.704Z",
      "updatedAt": "2025-02-27T12:37:58.704Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello vendor",
          "timestamp": "2025-02-27T12:37:58.704Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c05ca677b0838ae7417fe8",
          "senderType": "CUSTOMER",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c06957e729a9fd4b70409e",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "createdAt": "2025-02-27T13:32:07.536Z",
      "updatedAt": "2025-02-27T13:32:07.536Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:32:07.536Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c06957e729a9fd4b70409e",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c069f6b1b231d5c88fa532",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "createdAt": "2025-02-27T13:34:46.136Z",
      "updatedAt": "2025-02-27T13:34:46.136Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:34:46.136Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c069f6b1b231d5c88fa532",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:35:10.358Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c069f6b1b231d5c88fa532",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:35:52.957Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c069f6b1b231d5c88fa532",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:38:50.319Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c069f6b1b231d5c88fa532",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c06a925dcc3e41f7c03dc3",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "createdAt": "2025-02-27T13:37:22.111Z",
      "updatedAt": "2025-02-27T13:37:22.111Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:37:22.111Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c06a925dcc3e41f7c03dc3",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c06a9c5dcc3e41f7c03dc5",
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
      "createdAt": "2025-02-27T13:37:32.042Z",
      "updatedAt": "2025-02-27T13:37:32.042Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello vendor",
          "timestamp": "2025-02-27T13:37:32.042Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c06a9c5dcc3e41f7c03dc5",
          "senderType": "CUSTOMER",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c06aaa5dcc3e41f7c03dc7",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "createdAt": "2025-02-27T13:37:46.915Z",
      "updatedAt": "2025-02-27T13:37:46.915Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:37:46.915Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c06aaa5dcc3e41f7c03dc7",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    }
  ]
}
```

---

# **4. Send Message**

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
5.

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

#### **sentMessage**

```json
{
  "statusCode": 200,
  "error": false,
  "message": null,
  "data": [
    {
      "senderId": 2,
      "text": "Finally",
      "timestamp": "2025-02-28T17:48:12.954Z",
      "read": false,
      "recipientOnline": false,
      "chatId": "67c1f6dc898b2a0851b56f23",
      "senderType": "CUSTOMER",
      "messageImages": []
    }
  ]
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
  "chatId": "67c04c9f108c8c9aa29b1d11"
}
```

### **Server Actions:**

- Updates all unread messages in the chat as **read**.
- Emits **"updateReadReceipts"** to notify the other user.

### **Example Response:**

#### **updateReadReceipts emits**

```json
{
  "error": false,
  "message": "Messages marked as read",
  "statusCode": 200,
  "data": {}
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
  "chatId": "67c04c9f108c8c9aa29b1d11",
  "messageId": "67c04c9f108c8c9aa29b1d11"
}
```

1. Emits `"messageDeleted"`;

### **Example Response:**

#### **messageDeleted emits**

```json
{
  "error": false,
  "message": "Message has been deleted successfully",
  "statusCode": 200,
  "data": {}
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
  "chatId": "67c04c9f108c8c9aa29b1d11"
}
```

1. Emits `"userTyping"`;

### **Example Response:**

#### **userTyping emits**

```json
{
  "error": false,
  "message": "User is typing",
  "statusCode": 200,
  "data": {}
}
```

---

# **8. Get User Chats**

### **Event Name:** `getUserChats`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Fetches all chat conversations for the user.

1. Emits `"userChats"`.

### **Example Response:**

#### **userChats emits**

```json
{
  "statusCode": 200,
  "error": false,
  "message": "Chats has been sent successfully",
  "data": [
    {
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
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "CUSTOMER",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Are you crazy?",
          "timestamp": "2025-02-27T11:41:34.161Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Are you crazy?",
          "timestamp": "2025-02-27T11:42:17.134Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "CUSTOMER",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T11:44:47.287Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T12:38:36.425Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c04c9f108c8c9aa29b1d11",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c05ca677b0838ae7417fe8",
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
      "createdAt": "2025-02-27T12:37:58.704Z",
      "updatedAt": "2025-02-27T12:37:58.704Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello vendor",
          "timestamp": "2025-02-27T12:37:58.704Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c05ca677b0838ae7417fe8",
          "senderType": "CUSTOMER",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c06957e729a9fd4b70409e",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "createdAt": "2025-02-27T13:32:07.536Z",
      "updatedAt": "2025-02-27T13:32:07.536Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:32:07.536Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c06957e729a9fd4b70409e",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c069f6b1b231d5c88fa532",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "createdAt": "2025-02-27T13:34:46.136Z",
      "updatedAt": "2025-02-27T13:34:46.136Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:34:46.136Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c069f6b1b231d5c88fa532",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:35:10.358Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c069f6b1b231d5c88fa532",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:35:52.957Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c069f6b1b231d5c88fa532",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:38:50.319Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c069f6b1b231d5c88fa532",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c06a925dcc3e41f7c03dc3",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "createdAt": "2025-02-27T13:37:22.111Z",
      "updatedAt": "2025-02-27T13:37:22.111Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:37:22.111Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c06a925dcc3e41f7c03dc3",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c06a9c5dcc3e41f7c03dc5",
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
      "createdAt": "2025-02-27T13:37:32.042Z",
      "updatedAt": "2025-02-27T13:37:32.042Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello vendor",
          "timestamp": "2025-02-27T13:37:32.042Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c06a9c5dcc3e41f7c03dc5",
          "senderType": "CUSTOMER",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c06aaa5dcc3e41f7c03dc7",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "createdAt": "2025-02-27T13:37:46.915Z",
      "updatedAt": "2025-02-27T13:37:46.915Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-27T13:37:46.915Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c06aaa5dcc3e41f7c03dc7",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c1f5c2d04dd84f1bc240ed",
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
      "createdAt": "2025-02-28T17:43:30.934Z",
      "updatedAt": "2025-02-28T17:43:30.934Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-02-28T17:43:30.934Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c1f5c2d04dd84f1bc240ed",
          "senderType": "CUSTOMER",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hello",
          "timestamp": "2025-02-28T17:51:31.913Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c1f5c2d04dd84f1bc240ed",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-02-28T17:54:51.702Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c1f5c2d04dd84f1bc240ed",
          "senderType": "CUSTOMER",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Socket",
          "timestamp": "2025-02-28T17:55:07.912Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c1f5c2d04dd84f1bc240ed",
          "senderType": "VENDOR",
          "messageImages": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-02-28T17:55:53.275Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c1f5c2d04dd84f1bc240ed",
          "senderType": "VENDOR",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c1f62fd04dd84f1bc240ef",
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
      "createdAt": "2025-02-28T17:45:19.507Z",
      "updatedAt": "2025-02-28T17:45:19.507Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-02-28T17:45:19.507Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c1f62fd04dd84f1bc240ef",
          "senderType": "CUSTOMER",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c1f6667eed7952cb1deb70",
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
      "createdAt": "2025-02-28T17:46:08.176Z",
      "updatedAt": "2025-02-28T17:46:08.176Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-02-28T17:46:08.176Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c1f6667eed7952cb1deb70",
          "senderType": "CUSTOMER",
          "messageImages": []
        }
      ]
    },
    {
      "id": "67c1f6dc898b2a0851b56f23",
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
      "createdAt": "2025-02-28T17:48:12.954Z",
      "updatedAt": "2025-02-28T17:48:12.954Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-02-28T17:48:12.954Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c1f6dc898b2a0851b56f23",
          "senderType": "CUSTOMER",
          "messageImages": []
        }
      ]
    }
  ]
}
```

---

# **9. Stopped Typing**

### **Event Name:** `stoppedTyping`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Notifies the recipient that the sender has stopped typing.

1. Emits `"stoppedTyping"`;

### **Example Response:**

#### **stoppedTyping emits**

```json
{
  "error": false,
  "message": "User has stopped typing",
  "statusCode": 200,
  "data": {}
}
```

---

# **10. Disconnect**

### **Event Name:** `disconnect`

### **Emitted By:** Server

### **Received By:** Client

### **Description:**

Triggered when a user disconnects from the chat namespace.

---

## **Conclusion**

This chat system provides real-time messaging features with online status tracking, message persistence, and event-driven communication. Ensure that the client-side is correctly handling all these events for a smooth user experience. 🚀
