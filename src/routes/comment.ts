import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Comment } from "../controllers";
import { createProductComment, productId } from "./../middlewares/routes/comment";

const comment: Router = Router();

comment.post('/product/', createProductComment, asyncHandler(Comment.createProductComment));
// comment.get('/product/:id', asyncHandler(Comment.getWithId));
comment.get("/product/:productId", productId, asyncHandler(Comment.paginate));
comment.get('/product/:productId/:parentId/replies', productId, asyncHandler(Comment.paginateReplies));
comment.get("/product/like/:commentId", asyncHandler(Comment.like));


export default comment;
