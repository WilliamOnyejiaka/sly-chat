import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger } from ".";
import { validateJWT, validateUser, handleMulterErrors, secureApi, redisClientMiddleware, vendorIsActive, uploads } from "./../middlewares";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';
import { chat } from "../handlers";
import { ISocket } from "../types";
import { user } from "../routes";


function createApp() {
    const app: Application = express();
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: "*" } });
    const stream = { write: (message: string) => logger.http(message.trim()) };

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));

    const chatNamespace = io.of("/chat");

    chatNamespace.use((socket: ISocket, next: (err?: any) => void) => {
        const userId = socket.handshake.auth?.userId || socket.handshake.headers?.userId;



        // console.log(userId);
        console.log(socket.handshake.headers['yz']);

        // next(new Error("Hello Error"));
        next();
    });

    chat.initialize(chatNamespace);

    app.use(secureApi);
    
    app.use("/api/v1/user", user);

    app.post("/test2", async (req: Request, res: Response) => {
        res.status(200).json({
            'error': false,
            'message': "result"
        });
    });

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