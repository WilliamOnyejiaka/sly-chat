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

## Note

The basic structure for notification data is:

## Note

- The basic structure for notification data is:

```json
{
  "id": "68553796000745d4620985bc",
  "vendorId": 5,
  "customerId": null,
  "type": "product:upload",
  "channel": "PUSH",
  "content": {},
  "status": "SENT",
  "priority": 1,
  "createdAt": "2025-06-20T10:27:34.307Z",
  "updatedAt": "2025-06-20T10:27:34.307Z"
}
```

- The `content` data varies,depending on the `type` data.
- A user has to be listening for the `notification` emit, which has the same data structure as notification data.

---

# **1. Connection Event**

### **Event Name:** `connection`

### **Emitted By:** Server

### **Received By:** Client

### **Description:**

This event is triggered when a user establishes a connection to the **notification namespace**.

### **Flow:**

1. User connects to the presence namespace (`/notification`).
2. This event emits `"offlineNotifications"`.

### **Example Response:**

### **Success Response (User Connected)**

#### **offlineNotifications emit (Example data)**

```json
{
  "statusCode": 200,
  "error": false,
  "message": null,
  "data": {
    "items": [
      {
        "id": "68553796000745d4620985bc",
        "vendorId": 5,
        "customerId": null,
        "type": "product:upload",
        "channel": "PUSH",
        "content": {
          // Varies depending on the notification type
          "error": false,
          "message": "Product has been uploaded successfully",
          "data": {
            "id": 63,
            "name": "Mac",
            "description": "A mac book",
            "price": "22",
            "discountPrice": "3244.9",
            "isAvailable": true,
            "attributes": "afadfads",
            "additionalInfo": "affafasdsd",
            "metaData": "{ \"color\": \"red\"}",
            "averageRating": 0,
            "isFeatured": false,
            "createdAt": "2025-06-20T10:27:31.730Z",
            "updatedAt": "2025-06-20T10:27:31.730Z",
            "storeId": 7,
            "link": "http://localhost:3000/api/v1/vendor/product/",
            "categoryId": 1,
            "subcategoryId": 1,
            "productImage": [
              {
                "id": 63,
                "mimeType": "image/jpeg",
                "imageUrl": "https://res.cloudinary.com/dyjhe7cg2/image/upload/f_auto/q_auto/v1/ecommerce-cdn/products/fzjuvbdhrdun6fzvf09a?_a=BAMCkGRg0",
                "publicId": "ecommerce-cdn/products/fzjuvbdhrdun6fzvf09a",
                "size": 23678,
                "createdAt": "2025-06-20T10:27:31.730Z",
                "updatedAt": "2025-06-20T10:27:31.730Z",
                "productId": 63
              }
            ]
          }
        },
        "status": "SENT",
        "priority": 1,
        "createdAt": "2025-06-20T10:27:34.307Z",
        "updatedAt": "2025-06-20T10:27:34.307Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "nextPage": null,
      "prevPage": null,
      "hasNext": false,
      "hasPrev": false,
      "totalPages": 0,
      "totalRecords": 0
    }
  }
}
```

---

# **2. Disconnect**

### **Event Name:** `disconnect`

### **Emitted By:** Server

### **Received By:** Client

### **Description:**

Triggered when a user disconnects from the chat namespace.

1. Emits `"userIsOffline"` to the rooms that the user is in that the user has gone offline.

### **Example Response:**

#### **userIsOffline emit**

```json
{
  "error": false,
  "message": "User has gone offline",
  "data": {},
  "statusCode": 200
}
```

---

## **Conclusion**

This chat system provides real-time messaging features with online status tracking, message persistence, and event-driven communication. Ensure that the client-side is correctly handling all these events for a smooth user experience. 🚀
