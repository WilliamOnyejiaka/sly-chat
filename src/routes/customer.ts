import { Router, Request, Response } from "express";
import { Customer } from "../controllers";
import { uploads, validateBody } from "../middlewares";
import asyncHandler from "express-async-handler";

const customer: Router = Router();

customer.post(
    "/upload-profile-pic",
    uploads.single("image"),
    asyncHandler(Customer.uploadProfilePicture)
);

customer.get(
    "/",
    asyncHandler(Customer.getCustomerAll)
);

customer.delete(
    "/",
    asyncHandler(Customer.delete)
);

export default customer;