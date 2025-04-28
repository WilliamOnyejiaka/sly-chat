import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { createCustomer, createVendor } from "../middlewares/routes/user";
import { User } from "../controllers";

const user: Router = Router();

// user.post("/vendor", createVendor, asyncHandler(User.createVendor()));
// user.post("/customer", createCustomer, asyncHandler(User.createCustomer()));


export default user;
