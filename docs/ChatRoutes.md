The api key and the user's jwt are required for all the routes here.

### Chat Details Retrieval

This endpoint retrieves details of a specific chat identified by the provided parameters.

## Request

### HTTP Request

`GET http://localhost:4000/api/v1/chat/12345679/2/2`

- The productId first,then vendorId and customerId.

## Response

Upon a successful request, the server responds with a status code of 201 and a JSON object with the following properties:

- `error` (boolean): Indicates if an error occurred.
- `message` (string): A message related to the error, if applicable.
- `data` (object): Contains the chat details.
  - `id` (string): The chat's unique identifier.
  - `productId` (string): The product's identifier associated with the chat.
  - `vendorId` (number): The vendor's identifier.
  - `customerId` (number): The customer's identifier.
  - `productImageUrl` (string): URL of the product's image.
  - `productPrice` (string): The price of the product.
  - `productName` (string): The name of the product.
  - `storeLogoUrl` (string): URL of the store's logo.
  - `customerProfilePic` (string): URL of the customer's profile picture.
  - `customerName` (string): The name of the customer.
  - `storeName` (string): The name of the store.
  - `lastMessageAt` (string): Timestamp of the last message in the chat.
  - `createdAt` (string): Timestamp of the chat's creation.
  - `updatedAt` (string): Timestamp of the chat's last update.
  - `messages` (array): Array of messages exchanged in the chat.
    - `senderId` (number): The identifier of the message sender.
    - `text` (string): The content of the message.
    - `timestamp` (string): Timestamp of the message.
    - `read` (boolean): Indicates if the message has been read.
    - `recipientOnline` (boolean): Indicates if the recipient is online.
    - `chatId` (string): The identifier of the chat associated with the message.
    - `senderType` (string): Type of the message sender.
    - `messageMedias` (array): Array of media files attached to the message.

### Send Image Chat(Same For Pdfs and Videos)

This endpoint allows the client to send an image in a chat conversation.

- `POST {{host}}/api/v1/chat/send-image`
- `POST {{host}}/api/v1/chat/send-pdf`
- `POST {{host}}/api/v1/chat/send-video`

#### Request Body

- `productId` (text): The ID of the product.
- `recipientId` (text): The ID of the recipient.
- `storeName` (text): The name of the store.
- `productName` (text): The name of the product.
- `productPrice` (text): The price of the product.
- `productImageUrl` (text): The URL of the product image.
- `customerName` (text): The name of the customer.
- `storeLogo` (text): The URL of the store's logo.
- `customerProfilePic` (text): The URL of the customer's profile picture.
- `image` (file): The image file to be sent.(It can be any name)

#### Response

This route has two responses.

1. If a chat room is not found, it creates on and emits `newChat` event for the recipient and `receiveMedia` for the sender (The data sent for this two events is the same as `newChat` and `receiveMessage` events in the socket).

#### The Response

```json
{
  "error": false,
  "message": "New chat has been created",
  "data": {
    "id": "67cf08754860a5c46bd0fd71",
    "productId": "1234567987",
    "vendorId": 2,
    "customerId": 2,
    "productImageUrl": "productImageUrl",
    "productPrice": "2390",
    "productName": "Apple",
    "storeLogoUrl": null,
    "customerProfilePic": null,
    "customerName": "customerName",
    "storeName": "Jay Tech",
    "lastMessageAt": "2025-03-10T15:42:45.796Z",
    "createdAt": "2025-03-10T15:42:45.796Z",
    "updatedAt": "2025-03-10T15:42:45.796Z",
    "messages": [
      {
        "id": "67cf08754860a5c46bd0fd72",
        "senderId": 2,
        "text": null,
        "timestamp": "2025-03-10T15:42:45.796Z",
        "read": false,
        "recipientOnline": false,
        "chatId": "67cf08754860a5c46bd0fd71",
        "senderType": "CUSTOMER",
        "messageMedias": [
          {
            "id": "67cf08764860a5c46bd0fd73",
            "url": "http://res.cloudinary.com/dyjhe7cg2/raw/upload/v1741621365/chat-cdn/chat-pdfs/yazjzqq5s0uag57ymd3p",
            "size": "4067",
            "mimeType": "application/pdf",
            "thumbnail": "https://res.cloudinary.com/dyjhe7cg2/image/upload/so_1/v1/chat-cdn/chat-videos/nsfgzariz5eyamocmfls?_a=BAMCkGRg0"
          }
        ]
      }
    ]
  }
}
```

2. If a chat already exits, it just creates a new message and emits `receiveMedia` to both users like the `receiveMessage` event in the socket.

The following fields are not required for this type of response:

- `storeName`
- `productName`
- `productPrice`
- `productImageUrl`
- `customerName`
- `storeLogo`
- `customerProfilePic`

#### The Response

```json
{
  "error": true,
  "message": "Message has been sent",
  "data": {
    "id": "67c79cabef5676c3f6bed3bc",
    "senderId": 2,
    "senderType": "CUSTOMER",
    "text": null,
    "timestamp": "2025-03-05T00:36:59.269Z",
    "read": false,
    "recipientOnline": true,
    "chatId": "67c79b8bef5676c3f6bed3b9",
    "createdAt": "2025-03-05T00:36:59.269Z",
    "updatedAt": "2025-03-05T00:36:59.269Z",
    "messageMedias": [
      {
        "id": "67c79cabef5676c3f6bed3bd",
        "url": "https://res.cloudinary.com/dyjhe7cg2/image/upload/f_auto/q_auto/v1/chat-cdn/chat-images/vjhjkagb52s75oc0gwbw?_a=BAMCkGRg0",
        "size": "115998",
        "mimeType": "image/jpeg",
        "thumbnail": "https://res.cloudinary.com/dyjhe7cg2/image/upload/so_1/v1/chat-cdn/chat-videos/nsfgzariz5eyamocmfls?_a=BAMCkGRg0"
      }
    ]
  }
}
```
