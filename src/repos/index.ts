import { PrismaClient } from "@prisma/client";
import Chat from "./Chat";
import Message from "./Message";
import User from "./User";
import ProductComment from "./ProductComment";
import CommentLike from "./CommentLike";
import Store from "./Store";
import StoreFollower from "./StoreFollower";

const prisma: PrismaClient = new PrismaClient();

export default prisma;

export {
    Chat,
    Message,
    User,
    ProductComment,
    CommentLike,
    Store,
    StoreFollower
};
