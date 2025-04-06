import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Comment } from "../controllers";
import { createProductComment } from "./../middlewares/routes/comment";

const comment: Router = Router();

comment.post('/product/', createProductComment ,asyncHandler(Comment.createProductComment));
comment.get('/product/:id', asyncHandler(Comment.getWithId));
comment.get("/product",asyncHandler(Comment.paginate));
comment.get('/product/:parentId/replies', asyncHandler(Comment.paginateReplies));


export default comment;
