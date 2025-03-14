### Send Image Chat

This endpoint allows the client to send an image in a chat conversation.

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
- `image` (file): The Image file to be sent.
    

#### Response

Upon successful execution, the server returns a 201 status code with a JSON object containing the following fields:

- `error` (boolean): Indicates if an error occurred.
- `message` (string): A message related to the response.
- `data` (object): The data object containing the details of the sent image message.
    - `id` (string): The ID of the message.
    - `senderId` (number): The ID of the sender.
    - `senderType` (string): The type of the sender.
    - `text` (string): The text content of the message.
    - `timestamp` (string): The timestamp of the message.
    - `read` (boolean): Indicates if the message has been read.
    - `recipientOnline` (boolean): Indicates if the recipient is online.
    - `chatId` (string): The ID of the chat conversation.
    - `createdAt` (string): The timestamp of when the message was created.
    - `updatedAt` (string): The timestamp of when the message was last updated.
    - `messageMedias` (array): An array of media objects containing details of the sent image.
        - `id` (string): The ID of the media.
        - `imageUrl` (string): The URL of the sent image.
        - `size` (string): The size of the image.
        - `mimeType` (string): The MIME type of the image.