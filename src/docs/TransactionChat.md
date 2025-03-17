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
  "data": [
    {
      "id": "67c041dd744c61c167a18a32",
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
      "createdAt": "2025-02-27T10:43:41.905Z",
      "updatedAt": "2025-02-27T10:43:41.905Z",
      "messages": [
        {
          "senderId": 2,
          "text": "Are you crazy?",
          "timestamp": "2025-02-27T10:43:41.905Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c041dd744c61c167a18a32",
          "senderType": "CUSTOMER",
          "messageMedia": []
        }
      ]
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
    "id": "67c782b71fdd817ba74f45a2",
    "productId": "12345679",
    "vendorId": 2,
    "customerId": 2,
    "productImageUrl": "productImageUrl",
    "productPrice": "2390",
    "productName": "Apple",
    "storeLogoUrl": null,
    "customerProfilePic": null,
    "customerName": "customerName",
    "storeName": "Jay Tech",
    "lastMessageAt": "2025-03-04T23:01:23.308Z",
    "createdAt": "2025-03-04T22:46:15.111Z",
    "updatedAt": "2025-03-04T23:01:23.312Z",
    "messages": [
      {
        "senderId": 2,
        "text": "Finally",
        "timestamp": "2025-03-04T22:50:36.843Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": []
      },
      {
        "senderId": 2,
        "text": "Finally",
        "timestamp": "2025-03-04T22:52:17.913Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": []
      },
      {
        "senderId": 2,
        "text": null,
        "timestamp": "2025-03-04T22:54:03.797Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": [
          {
            "id": "67c7848b4cf3cbc2de5882cb",
            "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128843/chat-cdn/chat-pdfs/xxunqyyleyhbvwkynuni",
            "size": "4067",
            "mimeType": "application/pdf"
          }
        ]
      },
      {
        "senderId": 2,
        "text": null,
        "timestamp": "2025-03-04T22:57:23.587Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": [
          {
            "id": "67c785537035f667ef4bcdee",
            "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129042/chat-cdn/chat-pdfs/td9jqaqz3qpviy48nhbu",
            "size": "4067",
            "mimeType": "application/pdf"
          }
        ]
      },
      {
        "senderId": 2,
        "text": null,
        "timestamp": "2025-03-04T22:59:23.809Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": [
          {
            "id": "67c785cb39c67ec89ca65f10",
            "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129163/chat-cdn/chat-pdfs/axta7tbic2cre6o4edhv",
            "size": "4067",
            "mimeType": "application/pdf"
          }
        ]
      },
      {
        "senderId": 2,
        "text": null,
        "timestamp": "2025-03-04T23:01:10.311Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": [
          {
            "id": "67c7863673e79b84cc9e81e9",
            "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129269/chat-cdn/chat-pdfs/achgwryg28evtq6efqk0",
            "size": "4067",
            "mimeType": "application/pdf"
          }
        ]
      },
      {
        "senderId": 2,
        "text": "Hi Socket",
        "timestamp": "2025-03-04T23:01:23.312Z",
        "read": false,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "VENDOR",
        "messageMedias": []
      },
      {
        "senderId": 2,
        "text": "Hi Socket",
        "timestamp": "2025-03-04T22:50:28.241Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "VENDOR",
        "messageMedias": []
      },
      {
        "senderId": 2,
        "text": "Finally",
        "timestamp": "2025-03-04T22:49:35.710Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": []
      },
      {
        "senderId": 2,
        "text": "Hi Socket",
        "timestamp": "2025-03-04T22:48:33.962Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "VENDOR",
        "messageMedias": []
      },
      {
        "senderId": 2,
        "text": null,
        "timestamp": "2025-03-04T22:46:15.111Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": [
          {
            "id": "67c782b71fdd817ba74f45a4",
            "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128374/chat-cdn/chat-pdfs/yddnfa9zysjqyjpmf9ax",
            "size": "4067",
            "mimeType": "application/pdf"
          }
        ]
      },
      {
        "senderId": 2,
        "text": null,
        "timestamp": "2025-03-04T22:46:45.502Z",
        "read": true,
        "recipientOnline": true,
        "chatId": "67c782b71fdd817ba74f45a2",
        "senderType": "CUSTOMER",
        "messageMedias": [
          {
            "id": "67c782d51fdd817ba74f45a6",
            "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128405/chat-cdn/chat-pdfs/raudlbqxopthsnbb0egl",
            "size": "4067",
            "mimeType": "application/pdf"
          }
        ]
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
      "id": "67c605dec4286fc53e2ad992",
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
      "lastMessageAt": "2025-03-05T00:24:03.890Z",
      "createdAt": "2025-03-03T19:41:18.936Z",
      "updatedAt": "2025-03-05T00:24:03.893Z",
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
      ]
    },
    {
      "id": "67c60a31d1c7e0bc9ba5460c",
      "productId": "123456",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299.99",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "lastMessageAt": "2025-03-03T21:06:24.570Z",
      "createdAt": "2025-03-03T19:59:45.351Z",
      "updatedAt": "2025-03-03T21:06:24.576Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-03T21:06:24.576Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c60a31d1c7e0bc9ba5460c",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c619d0aded1b8471708cb5",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741035983/chat-cdn/chat-pdfs/rd3r6py0dlndackucozm",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-03T20:53:50.378Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c60a31d1c7e0bc9ba5460c",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-03T19:59:59.072Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c60a31d1c7e0bc9ba5460c",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hello Chat",
          "timestamp": "2025-03-03T19:59:45.351Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c60a31d1c7e0bc9ba5460c",
          "senderType": "CUSTOMER",
          "messageMedias": []
        }
      ]
    },
    {
      "id": "67c780d8443de0dd1e102b0c",
      "productId": "1234567",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "productImageUrl",
      "productPrice": "2390",
      "productName": "Apple",
      "storeLogoUrl": null,
      "customerProfilePic": null,
      "customerName": "customerName",
      "storeName": "Jay Tech",
      "lastMessageAt": "2025-03-04T22:38:16.210Z",
      "createdAt": "2025-03-04T22:38:16.210Z",
      "updatedAt": "2025-03-04T22:38:16.210Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:38:16.210Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c780d8443de0dd1e102b0c",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c780d8443de0dd1e102b0e",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741127895/chat-cdn/chat-pdfs/h8ct7tni3dukynbfyzwd",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        }
      ]
    },
    {
      "id": "67c782b71fdd817ba74f45a2",
      "productId": "12345679",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "productImageUrl",
      "productPrice": "2390",
      "productName": "Apple",
      "storeLogoUrl": null,
      "customerProfilePic": null,
      "customerName": "customerName",
      "storeName": "Jay Tech",
      "lastMessageAt": "2025-03-04T23:01:23.308Z",
      "createdAt": "2025-03-04T22:46:15.111Z",
      "updatedAt": "2025-03-04T23:01:23.312Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T23:01:10.311Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c7863673e79b84cc9e81e9",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129269/chat-cdn/chat-pdfs/achgwryg28evtq6efqk0",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:59:23.809Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c785cb39c67ec89ca65f10",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129163/chat-cdn/chat-pdfs/axta7tbic2cre6o4edhv",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:57:23.587Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c785537035f667ef4bcdee",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129042/chat-cdn/chat-pdfs/td9jqaqz3qpviy48nhbu",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:54:03.797Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c7848b4cf3cbc2de5882cb",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128843/chat-cdn/chat-pdfs/xxunqyyleyhbvwkynuni",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-03-04T22:52:17.913Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-03-04T22:50:36.843Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-04T23:01:23.312Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-04T22:50:28.241Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-03-04T22:49:35.710Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-04T22:48:33.962Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:46:45.502Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c782d51fdd817ba74f45a6",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128405/chat-cdn/chat-pdfs/raudlbqxopthsnbb0egl",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:46:15.111Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c782b71fdd817ba74f45a4",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128374/chat-cdn/chat-pdfs/yddnfa9zysjqyjpmf9ax",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        }
      ]
    },
    {
      "id": "67c79b8bef5676c3f6bed3b9",
      "productId": "123450",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "2334",
      "productName": "Mac",
      "storeLogoUrl": null,
      "customerProfilePic": "https://example.com/product-image.jpg",
      "customerName": "Johnny Storm",
      "storeName": "Jay Tech",
      "lastMessageAt": "2025-03-05T00:36:59.267Z",
      "createdAt": "2025-03-05T00:32:11.106Z",
      "updatedAt": "2025-03-05T00:36:59.269Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-05T00:36:59.269Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c79b8bef5676c3f6bed3b9",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c79cabef5676c3f6bed3bd",
              "imageUrl": "https://res.cloudinary.com/dyjhe7cg2/image/upload/f_auto/q_auto/v1/chat-cdn/chat-images/vjhjkagb52s75oc0gwbw?_a=BAMCkGRg0",
              "size": "115998",
              "mimeType": "image/jpeg"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-05T00:32:11.106Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c79b8bef5676c3f6bed3b9",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c79b8bef5676c3f6bed3bb",
              "imageUrl": "https://res.cloudinary.com/dyjhe7cg2/image/upload/f_auto/q_auto/v1/chat-cdn/chat-images/l9mkno86l8cb9wurc1ef?_a=BAMCkGRg0",
              "size": "115998",
              "mimeType": "image/jpeg"
            }
          ]
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

1. If the recipient is **online**, it emits `newChat`.
2. If the recipient is **offline**, mark the message as **unread**.
3. If the chat does not exist, and the recipient is online ,the server emits `receiveMessage`, the productId and recipientId are required.
4. If a chat already exists or not it emits `receiveMessage`.The recipient with not get this event if the chat is new.

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
    "productImageUrl": "https://example.com/product-image.jpg",
    "productPrice": "299.99",
    "productName": "Wireless Headphones",
    "storeLogoUrl": "https://example.com/store-logo.png",
    "customerProfilePic": "https://example.com/buyer-profile.jpg",
    "customerName": "John Doe",
    "storeName": "Tech Haven",
    "lastMessageAt": "2025-03-05T00:43:41.523Z",
    "createdAt": "2025-03-05T00:43:41.523Z",
    "updatedAt": "2025-03-05T00:43:41.523Z",
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
    ]
  },
  "data": {}
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
  "productId": "3234352",
  "recipientId": 2
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
      "productId": "1234589679",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299.99",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "lastMessageAt": "2025-03-05T00:43:41.523Z",
      "createdAt": "2025-03-05T00:43:41.523Z",
      "updatedAt": "2025-03-05T00:43:41.523Z",
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
      ]
    },
    {
      "id": "67c79b8bef5676c3f6bed3b9",
      "productId": "123450",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "2334",
      "productName": "Mac",
      "storeLogoUrl": null,
      "customerProfilePic": "https://example.com/product-image.jpg",
      "customerName": "Johnny Storm",
      "storeName": "Jay Tech",
      "lastMessageAt": "2025-03-05T00:36:59.267Z",
      "createdAt": "2025-03-05T00:32:11.106Z",
      "updatedAt": "2025-03-05T00:36:59.269Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-05T00:36:59.269Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c79b8bef5676c3f6bed3b9",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c79cabef5676c3f6bed3bd",
              "imageUrl": "https://res.cloudinary.com/dyjhe7cg2/image/upload/f_auto/q_auto/v1/chat-cdn/chat-images/vjhjkagb52s75oc0gwbw?_a=BAMCkGRg0",
              "size": "115998",
              "mimeType": "image/jpeg"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-05T00:32:11.106Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c79b8bef5676c3f6bed3b9",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c79b8bef5676c3f6bed3bb",
              "imageUrl": "https://res.cloudinary.com/dyjhe7cg2/image/upload/f_auto/q_auto/v1/chat-cdn/chat-images/l9mkno86l8cb9wurc1ef?_a=BAMCkGRg0",
              "size": "115998",
              "mimeType": "image/jpeg"
            }
          ]
        }
      ]
    },
    {
      "id": "67c605dec4286fc53e2ad992",
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
      "lastMessageAt": "2025-03-05T00:24:03.890Z",
      "createdAt": "2025-03-03T19:41:18.936Z",
      "updatedAt": "2025-03-05T00:24:03.893Z",
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
      ]
    },
    {
      "id": "67c782b71fdd817ba74f45a2",
      "productId": "12345679",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "productImageUrl",
      "productPrice": "2390",
      "productName": "Apple",
      "storeLogoUrl": null,
      "customerProfilePic": null,
      "customerName": "customerName",
      "storeName": "Jay Tech",
      "lastMessageAt": "2025-03-04T23:01:23.308Z",
      "createdAt": "2025-03-04T22:46:15.111Z",
      "updatedAt": "2025-03-04T23:01:23.312Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T23:01:10.311Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c7863673e79b84cc9e81e9",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129269/chat-cdn/chat-pdfs/achgwryg28evtq6efqk0",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:59:23.809Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c785cb39c67ec89ca65f10",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129163/chat-cdn/chat-pdfs/axta7tbic2cre6o4edhv",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:57:23.587Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c785537035f667ef4bcdee",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741129042/chat-cdn/chat-pdfs/td9jqaqz3qpviy48nhbu",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:54:03.797Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c7848b4cf3cbc2de5882cb",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128843/chat-cdn/chat-pdfs/xxunqyyleyhbvwkynuni",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-03-04T22:52:17.913Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-03-04T22:50:36.843Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-04T23:01:23.312Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-04T22:50:28.241Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Finally",
          "timestamp": "2025-03-04T22:49:35.710Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-04T22:48:33.962Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:46:45.502Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c782d51fdd817ba74f45a6",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128405/chat-cdn/chat-pdfs/raudlbqxopthsnbb0egl",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:46:15.111Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c782b71fdd817ba74f45a2",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c782b71fdd817ba74f45a4",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741128374/chat-cdn/chat-pdfs/yddnfa9zysjqyjpmf9ax",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        }
      ]
    },
    {
      "id": "67c780d8443de0dd1e102b0c",
      "productId": "1234567",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "productImageUrl",
      "productPrice": "2390",
      "productName": "Apple",
      "storeLogoUrl": null,
      "customerProfilePic": null,
      "customerName": "customerName",
      "storeName": "Jay Tech",
      "lastMessageAt": "2025-03-04T22:38:16.210Z",
      "createdAt": "2025-03-04T22:38:16.210Z",
      "updatedAt": "2025-03-04T22:38:16.210Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-04T22:38:16.210Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c780d8443de0dd1e102b0c",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c780d8443de0dd1e102b0e",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741127895/chat-cdn/chat-pdfs/h8ct7tni3dukynbfyzwd",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        }
      ]
    },
    {
      "id": "67c60a31d1c7e0bc9ba5460c",
      "productId": "123456",
      "vendorId": 2,
      "customerId": 2,
      "productImageUrl": "https://example.com/product-image.jpg",
      "productPrice": "299.99",
      "productName": "Wireless Headphones",
      "storeLogoUrl": "https://example.com/store-logo.png",
      "customerProfilePic": "https://example.com/buyer-profile.jpg",
      "customerName": "John Doe",
      "storeName": "Tech Haven",
      "lastMessageAt": "2025-03-03T21:06:24.570Z",
      "createdAt": "2025-03-03T19:59:45.351Z",
      "updatedAt": "2025-03-03T21:06:24.576Z",
      "messages": [
        {
          "senderId": 2,
          "text": null,
          "timestamp": "2025-03-03T21:06:24.576Z",
          "read": false,
          "recipientOnline": true,
          "chatId": "67c60a31d1c7e0bc9ba5460c",
          "senderType": "CUSTOMER",
          "messageMedias": [
            {
              "id": "67c619d0aded1b8471708cb5",
              "imageUrl": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741035983/chat-cdn/chat-pdfs/rd3r6py0dlndackucozm",
              "size": "4067",
              "mimeType": "application/pdf"
            }
          ]
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-03T20:53:50.378Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c60a31d1c7e0bc9ba5460c",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hi Socket",
          "timestamp": "2025-03-03T19:59:59.072Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c60a31d1c7e0bc9ba5460c",
          "senderType": "VENDOR",
          "messageMedias": []
        },
        {
          "senderId": 2,
          "text": "Hello Chat",
          "timestamp": "2025-03-03T19:59:45.351Z",
          "read": true,
          "recipientOnline": true,
          "chatId": "67c60a31d1c7e0bc9ba5460c",
          "senderType": "CUSTOMER",
          "messageMedias": []
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
