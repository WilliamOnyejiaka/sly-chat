"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_1 = require("../middlewares/routes/user");
const controllers_1 = require("../controllers");
const user = (0, express_1.Router)();
user.post("/vendor", user_1.createVendor, (0, express_async_handler_1.default)(controllers_1.User.createVendor()));
user.post("/customer", user_1.createCustomer, (0, express_async_handler_1.default)(controllers_1.User.createCustomer()));
exports.default = user;
