import { PrismaClient } from "@prisma/client";
import Chat from "./Chat";
import Message from "./Message";
import Store from "./Store";
import Vendor from "./Vendor";
import Customer from "./Customer";
import Notification from "./Notification";

const prisma: PrismaClient = new PrismaClient();

export default prisma;

export {
    Chat,
    Message,
    Store,
    Customer,
    Vendor,
    Notification
};
