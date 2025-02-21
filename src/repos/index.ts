import { PrismaClient } from "@prisma/client";
import Vendor from "./Vendor";
import VendorProfilePicture from "./VendorProfilePicture";
import Customer from "./Customer";
import CustomerProfilePic from "./CustomerProfilePic";
import Chat from "./Chat";
import Message from "./Message";

const prisma: PrismaClient = new PrismaClient();

export default prisma;

export {
    Vendor,
    VendorProfilePicture,
    Customer,
    CustomerProfilePic,
    Chat,
    Message
};
