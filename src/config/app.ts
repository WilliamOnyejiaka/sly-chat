import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger } from ".";
import { auth, vendor, store, seed, admin, role, adminVendor, permission, adminPermission, adminStore, adminCategory, customer, category } from "./../routes";
import { Cloudinary, Email, TwilioService } from "../services";
import path from "path";
import ejs from "ejs";
import { validateJWT, validateUser, handleMulterErrors, secureApi, redisClientMiddleware, vendorIsActive, uploads } from "./../middlewares";
import Redis from "ioredis";
import asyncHandler from "express-async-handler";
import { Admin } from "../controllers";
import { VendorCache } from "../cache";
import { Vendor as VendorRepo } from "../repos";
import cors from "cors";
import { baseUrl } from "../utils";
import { urls } from "../constants";
import { validationResult } from "express-validator";
import { passwordIsValid } from "../middlewares/validators/validators";
import http from 'http';
import { Server } from 'socket.io';
import { Chat } from "../namespaces";
import { chat } from "../handlers";
import { ISocket } from "../types";



function createApp() {
    const app: Application = express();
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: "*" } });

    const vendorRepo: VendorRepo = new VendorRepo();
    const vendorCache: VendorCache = new VendorCache();

    const stream = {
        write: (message: string) => logger.http(message.trim()),
    };

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));
    app.use("/api/v1/seed", seed);
    app.get("/api/v1/admin/default-admin/:roleId", asyncHandler(Admin.defaultAdmin));

    // app.use(secureApi); TODO: uncomment this
    app.use("/api/v1/auth", auth);
    app.use(
        "/api/v1/vendor",
        validateJWT(["vendor"], env("tokenSecret")!),
        validateUser<VendorCache, VendorRepo>(vendorCache, vendorRepo),
        vendor
    );
    app.use("/api/v1/store", validateJWT(["vendor"], env("tokenSecret")!) /* TODO: uncomment this and find the bugs,vendorIsActive*/, store);
    app.use("/api/v1/admin", validateJWT(["admin"], env("tokenSecret")!), admin);
    app.use("/api/v1/admin/role", validateJWT(["admin"], env("tokenSecret")!), role);
    app.use("/api/v1/admin/vendor", validateJWT(["admin"], env("tokenSecret")!), adminVendor);
    app.use("/api/v1/admin/permission", validateJWT(["admin"], env("tokenSecret")!), permission);
    app.use("/api/v1/admin/admin-permission", validateJWT(["admin"], env("tokenSecret")!), adminPermission);
    app.use("/api/v1/admin/store", validateJWT(["admin"], env("tokenSecret")!), adminStore);
    app.use("/api/v1/admin/category", validateJWT(["admin"], env("tokenSecret")!), adminCategory);
    app.use("/api/v1/category", validateJWT(["admin", "vendor"], env("tokenSecret")!), category);

    app.use(
        "/api/v1/customer",
        validateJWT(["customer"], env("tokenSecret")!),
        // validateUser<VendorCache, VendorRepo>(vendorCache, vendorRepo),
        customer
    );

    app.post("/test2", async (req: Request, res: Response) => {
        res.status(200).json({
            'error': false,
            'message': "result"
        });
    });

    app.post("/test1", async (req: Request, res: Response, next: NextFunction) => {
        const twilio = new TwilioService();
        const serviceResult = await twilio.sendSMS(req.body.to, req.body.message);
        res.status(serviceResult.statusCode).json(serviceResult.json)
    });

    const chatNamespace = io.of("/chat");

    chatNamespace.use((socket: ISocket, next: (err?: any) => void) => {
        const userId = socket.handshake.auth?.userId || socket.handshake.headers?.userId;



        // console.log(userId);
        console.log(socket.handshake.headers['yz']);

        // next(new Error("Hello Error"));
        next();
    });

    chat.initialize(chatNamespace);

    app.use(handleMulterErrors);

    app.use((req: Request, res: Response, next: NextFunction) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        })
    });

    return server;
}


export default createApp;