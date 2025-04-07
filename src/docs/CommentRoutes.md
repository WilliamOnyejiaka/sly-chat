### The routes listed here are for product comments. Later this doc will be updated for store comments.

### Create Comment

### POST /api/v1/comment/product/

This endpoint allows the client to create a new comment for a specific product.If

#### Request Body

- `content` (string, required): The content of the comment.
- `productId` (number, required): The ID of the product for which the comment is being created.
- `parentId` (string, optional): The ID of the parent comment. For replies.

#### Response

The response is in JSON format and follows the schema below:

```json
{
  "type": "object",
  "properties": {
    "error": {
      "type": "boolean"
    },
    "message": {
      "type": "string"
    },
    "data": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "content": {
          "type": "string"
        },
        "productId": {
          "type": "number"
        },
        "userId": {
          "type": "number"
        },
        "userType": {
          "type": "string"
        },
        "createdAt": {
          "type": "string"
        },
        "updatedAt": {
          "type": "string"
        },
        "parentId": {
          "type": ["string", "null"] // If there is no parentId
        }
      }
    }
  }
}
```
