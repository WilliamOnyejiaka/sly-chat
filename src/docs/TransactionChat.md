# **Socket Events Documentation for Chat System**

This document provides an extensive explanation of all the events supported in the chat system. The system uses **Socket.io** for real-time communication and follows a **namespace-based structure** to manage different types of connections.

## **Production Url**

https://sly-chat.onrender.com

## **Overview**

The chat system is designed to facilitate real-time messaging between **customers** and **vendors** in an eCommerce platform.  
Each user can:

## Note if there is an error, the server emits `appError`.

## Note if a the user requesting a chat or chat list is a vendor, the customer profile will be there, but if the user is a customer, the vendor's profile and store details will be there.

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
7. If the user is a vendor, there will be a `customer` object, but if the user is customer, then there will be a `vendor` object.

### **Example Response:**

### **Success Response (User Connected)**

#### ** offlineMessages emit**

```json
{
  "statusCode": 200,
  "error": false,
  "message": "Offline messages has been sent successfully",
  "data": {
    "items": [
      {
        "id": "685aba2ab276ec25a711e6c0",
        "senderId": 5,
        "senderType": "VENDOR",
        "recipientId": 1,
        "recipientType": "CUSTOMER",
        "text": "Hi Customer",
        "timestamp": "2025-06-24T14:46:02.473Z",
        "recipientOnline": true,
        "chatId": "685aba25b276ec25a711e6be",
        "createdAt": "2025-06-24T14:46:02.473Z",
        "updatedAt": "2025-06-24T14:46:02.473Z",
        "supportChatId": null,
        "chat": {
          "id": "685aba25b276ec25a711e6be",
          "productId": 12345,
          "vendorId": 5,
          "customerId": 1,
          "lastMessageAt": "2025-06-24T14:46:03.713Z",
          "createdAt": "2025-06-24T14:45:57.164Z",
          "unReadCustomerMessages": true,
          "unReadVendorMessages": false
        }
      },
      {
        "id": "685aba25b276ec25a711e6bf",
        "senderId": 5,
        "senderType": "VENDOR",
        "recipientId": 1,
        "recipientType": "CUSTOMER",
        "text": "Hi Customer",
        "timestamp": "2025-06-24T14:45:57.164Z",
        "recipientOnline": true,
        "chatId": "685aba25b276ec25a711e6be",
        "createdAt": "2025-06-24T14:45:57.164Z",
        "updatedAt": "2025-06-24T14:45:57.164Z",
        "supportChatId": null,
        "chat": {
          "id": "685aba25b276ec25a711e6be",
          "productId": 12345,
          "vendorId": 5,
          "customerId": 1,
          "lastMessageAt": "2025-06-24T14:46:03.713Z",
          "createdAt": "2025-06-24T14:45:57.164Z",
          "unReadCustomerMessages": true,
          "unReadVendorMessages": false
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "nextPage": null,
      "prevPage": null,
      "hasNext": false,
      "hasPrev": false,
      "totalPages": 1,
      "totalRecords": 2
    }
  }
}
```

#### **userChats emit**

```json
{
  "statusCode": 200,
  "error": false,
  "message": "Chats have been sent successfully",
  "data": {
    "items": [
      {
        "id": "685aba25b276ec25a711e6be",
        "productId": 12345,
        "vendorId": 5,
        "customerId": 1,
        "lastMessageAt": "2025-06-24T14:46:03.713Z",
        "createdAt": "2025-06-24T14:45:57.164Z",
        "unReadCustomerMessages": true,
        "unReadVendorMessages": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "nextPage": null,
      "prevPage": null,
      "hasNext": false,
      "hasPrev": false,
      "totalPages": 1,
      "totalRecords": 1
    }
  }
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
  "productId": 12345,
  "recipientId": 5
}
```

### **Server Actions:**

- Fetch the chat from the database.
- Mark previous unread messages as **read**.
- Emit **"loadChat"** to the user with chat history.

### **Example Response:**

#### **loadMessages emit**

```json
{
  "statusCode": 200,
  "error": false,
  "message": "Chat has been loaded",
  "data": {
    "id": "685aba25b276ec25a711e6be",
    "productId": 12345,
    "vendorId": 5,
    "customerId": 1,
    "lastMessageAt": "2025-06-24T14:46:03.713Z",
    "createdAt": "2025-06-24T14:45:57.164Z",
    "unReadCustomerMessages": true,
    "unReadVendorMessages": false,
    "messages": [
      {
        "id": "685aba25b276ec25a711e6bf",
        "senderId": 5,
        "text": "Hi Customer",
        "timestamp": "2025-06-24T14:45:57.164Z",
        "recipientOnline": true,
        "chatId": "685aba25b276ec25a711e6be",
        "senderType": "VENDOR",
        "messageMedias": []
      },
      {
        "id": "685aba2ab276ec25a711e6c0",
        "senderId": 5,
        "text": "Hi Customer",
        "timestamp": "2025-06-24T14:46:02.473Z",
        "recipientOnline": true,
        "chatId": "685aba25b276ec25a711e6be",
        "senderType": "VENDOR",
        "messageMedias": []
      }
    ],
    "pagination": {
      "currentPage": 1,
      "nextPage": null,
      "prevPage": null,
      "hasNext": false,
      "hasPrev": false,
      "totalPages": 1,
      "totalRecords": 2
    }
  }
}
```

---

# **3. Join Rooms**

### ** Leave For Now **

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
      "id": "67c605dec4286fc53e2ad992",
      "productId": "12345",
      "vendorId": 2,
      "customerId": 2,
      "storeId": 6,
      "lastMessageAt": "2025-03-05T00:24:03.890Z",
      "createdAt": "2025-03-03T19:41:18.936Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-05T00:24:03.893Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c605dec4286fc53e2ad992",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c799a4ef5676c3f6bed3b8",
              "imageUrl": "https://res.cloudinary.com/dyjhe7cg2/image/upload/f_auto/q_auto/v1/chat-cdn/chat-images/vyaxadgv97gchxucrbcy?_a=BAMCkGRg0",
              "size": "115998",
              "mimeType": "image/jpeg"
            }
          ]
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-03T19:56:53.019Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c605dec4286fc53e2ad992",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-03T19:47:15.485Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c605dec4286fc53e2ad992",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-03T19:41:26.577Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c605dec4286fc53e2ad992",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hello Chat",
          "timestamp": "2025-03-03T19:58:25.242Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c605dec4286fc53e2ad992",
          "senderType": "CUSTOMER",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hello Chat",
          "timestamp": "2025-03-03T19:41:18.936Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c605dec4286fc53e2ad992",
          "senderType": "CUSTOMER",
          "messageMedias": []
        }
      ],
      "vendor": {
        "id": "680f9806bc5c3ba5f87ffff2",
        "userId": 4,
        "firstName": "William",
        "lastName": "Lock 7",
        "profilePictureUrl": null,
        "email": "williamonyejiakddda2021@gmail.com",
        "verified": false,
        "phoneNumber": "sdxlkkshhjbdjhddfdfnfss",
        "active": true,
        "createdAt": "2025-04-28T15:00:20.655Z",
        "updatedAt": "2025-04-28T15:00:20.655Z",
        "store": [
          {
            "id": "680f98fac7fe6cd09231fe63",
            "name": "Wonderds",
            "vendorId": 4,
            "storeId": 7,
            "storeLogoUrl": null,
            "createdAt": "2025-04-28T15:04:26.541Z",
            "updatedAt": "2025-04-28T15:04:26.541Z"
          }
        ]
      }
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
  "productId": 12345,
  "text": "Are you crazy?",
  "recipientId": 2
}
```

### **Server Actions:**

1. If the recipient is **online**, it emits `newChat`.
2. If the chat does not exist, and the recipient is online ,the server emits `receiveMessage`, the productId and recipientId are required.
3. If a chat already exists or not it emits `receiveMessage`.The recipient with not get this event if the chat is new.

### **Example Response:**

#### **newChat**

```json
{
  "statusCode": 200,
  "error": false,
  "message": {
    "id": "67c79e3def5676c3f6bed3be",
    "productId": "1234589679",
    "vendorId": 2,
    "customerId": 2,
    "lastMessageAt": "2025-03-05T00:43:41.523Z",
    "createdAt": "2025-03-05T00:43:41.523Z",
    "unReadCustomerMessages": true,
    "unReadVendorMessages": false,
    "messages": [
      {
        "senderId": 2,
        "text": "Finally",
        "timestamp": "2025-03-05T00:43:41.523Z",
        "read": false,
        "recipientOnline": true,
        "chatId": "67c79e3def5676c3f6bed3be",
        "senderType": "CUSTOMER",
        "messageMedias": []
      }
    ],
    "customer": {
      "id": "680f9806bc5c3ba5f87ffff2",
      "userId": 4,
      "firstName": "William",
      "lastName": "Lock 7",
      "profilePictureUrl": null,
      "email": "williamonyejiakddda2021@gmail.com",
      "verified": false,
      "phoneNumber": "sdxlkkshhjbdjhddfdfnfss",
      "active": true,
      "createdAt": "2025-04-28T15:00:20.655Z",
      "updatedAt": "2025-04-28T15:00:20.655Z"
    }
  }
}
```

#### **receiveMessage**

```json
{
  "statusCode": 200,
  "error": false,
  "message": null,
  "data": [
    {
      "senderId": 2,
      "text": "Finally",
      "timestamp": "2025-03-05T00:43:41.523Z",
      "read": false,
      "recipientOnline": true,
      "chatId": "67c79e3def5676c3f6bed3be",
      "senderType": "CUSTOMER",
      "messageMedias": []
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
  "statusCode": 200,
  "error": false,
  "message": {
    "id": "67c79e3def5676c3f6bed3be",
    "productId": "1234589679",
    "vendorId": 2,
    "customerId": 2,
    "lastMessageAt": "2025-03-05T00:43:41.523Z",
    "createdAt": "2025-03-05T00:43:41.523Z",
    "unReadCustomerMessages": true,
    "unReadVendorMessages": false,
    "messages": [
      {
        "senderId": 2,
        "text": "Finally",
        "timestamp": "2025-03-05T00:43:41.523Z",
        "read": false,
        "recipientOnline": true,
        "chatId": "67c79e3def5676c3f6bed3be",
        "senderType": "CUSTOMER",
        "messageMedias": []
      }
    ],
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

### ** Leave For Now **

### **Event Name:** `deleteMessage`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

Deletes a specific message from a chat.

### **Payload (From Client):**

```json
{
  "productId": "3234352",
  "recipientId": 2,
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
  "productId": "3234352",
  "recipientId": 2
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

### ** Leave For Now **

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
      "id": "67c79e3def5676c3f6bed3be",
      "productId": 89,
      "vendorId": 2,
      "customerId": 2,
      "storeId": 9,
      "lastMessageAt": "2025-03-05T00:43:41.523Z",
      "createdAt": "2025-03-05T00:43:41.523Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-03-05T00:43:41.523Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c79e3def5676c3f6bed3be",
          "senderType": "CUSTOMER",
          "messageMedias": []
        }
      ],
      "vendor": {
        "id": "680f9806bc5c3ba5f87ffff2",
        "userId": 4,
        "firstName": "William",
        "lastName": "Lock 7",
        "profilePictureUrl": null,
        "email": "williamonyejiakddda2021@gmail.com",
        "verified": false,
        "phoneNumber": "sdxlkkshhjbdjhddfdfnfss",
        "active": true,
        "createdAt": "2025-04-28T15:00:20.655Z",
        "updatedAt": "2025-04-28T15:00:20.655Z",
        "store": [
          {
            "id": "680f98fac7fe6cd09231fe63",
            "name": "Wonderds",
            "vendorId": 4,
            "storeId": 7,
            "storeLogoUrl": null,
            "createdAt": "2025-04-28T15:04:26.541Z",
            "updatedAt": "2025-04-28T15:04:26.541Z"
          }
        ]
      }
    }
  ]
}
```

---

# **9. Stopped Typing**

### ** Leave For Now **

### **Event Name:** `stoppedTyping`

### **Emitted By:** Client

### **Received By:** Server

### **Description:**

### **Payload (From Client):**

```json
{
  "productId": "3234352",
  "recipientId": 2
}
```

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
