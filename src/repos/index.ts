import { PrismaClient } from "@prisma/client";
import Chat from "./Chat";
import Message from "./Message";
import User from "./User";
import ProductComment from "./ProductComment";

const prisma: PrismaClient = new PrismaClient();

export default prisma;

export {
    Chat,
    Message,
    User,
    ProductComment
};
