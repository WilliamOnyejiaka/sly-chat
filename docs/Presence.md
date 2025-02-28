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

---

# **1. Connection Event**

### **Event Name:** `connection`

### **Emitted By:** Server

### **Received By:** Client

### **Description:**

This event is triggered when a user establishes a connection to the **chat namespace**.

### **Flow:**

1. User connects to the presence namespace (`/presence`).
2. This event emits `"userIsOnline"`.

### **Example Response:**

### **Success Response (User Connected)**

#### **userIsOnline emit**

```json
{
  "statusCode": 200,
  "error": false,
  "message": "User is online",
  "data": {}
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
