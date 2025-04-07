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
### Get Comment Replies

### GET /api/v1/comment/product/{productId}/{commentId}/replies

This endpoint retrieves the replies for a specific comment on a product.

#### Request

- Path Parameters
    - productId (number): The ID of the product.
    - commentId (string): The ID of the comment.
- Query Parameters
    - page (number): The page number of the results.
    - limit (number): The maximum number of replies per page.
    - depth (number): The depth of the replies to retrieve.

#### Response

The response is in JSON format and follows the schema below:

``` json
{
  "error": "boolean",
  "message": "string",
  "data": {
    "data": {
      "items": [
        {
          "id": "string",
          "content": "string",
          "productId": "number",
          "userId": "number",
          "userType": "string",
          "createdAt": "string",
          "updatedAt": "string",
          "parentId": "string",
          "replies": "array"
        }
      ],
      "totalItems": "number"
    },
    "pagination": {
      "currentPage": "number",
      "nextPage": "number",
      "prevPage": "number",
      "hasNext": "boolean",
      "hasPrev": "boolean",
      "totalPages": "number",
      "totalRecords": "number"
    }
  }
}

 ```

The response includes an error flag, a message, and data containing an array of reply items with their respective details. The pagination information is also provided to navigate through the results.

