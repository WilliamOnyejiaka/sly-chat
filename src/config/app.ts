import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger } from ".";
import { validateJWT, validateUser, handleMulterErrors, secureApi, redisClientMiddleware, vendorIsActive, uploads } from "./../middlewares";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';
import { chat, presence } from "../events";
import { ISocket } from "../types";
import { user, chat as chatRoute } from "../routes";
import { Namespace } from "../types/enums";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

function createApp() {
    const app: Application = express();
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: "*" } });

    // const pubClient = createClient({ url: env('redisURL')! });
    // const subClient = pubClient.duplicate();

    // Promise.all([pubClient.connect(), subClient.connect()])
    //     .then(() => {
    //         io.adapter(createAdapter(pubClient, subClient));
    //         console.log("Redis Adapter Connected");
    //     })
    //     .catch(err => console.error("Redis Connection Error:", err));

    const stream = { write: (message: string) => logger.http(message.trim()) };

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));

    const chatNamespace = io.of("/chat");
    const presenceNamespace = io.of('/presence');
    const notificationNamespace = io.of(Namespace.NOTIFICATION);

    chatNamespace.use(validateJWT(["customer", "vendor"], env("tokenSecret")!));
    presenceNamespace.use(validateJWT(["customer", "vendor", "admin"], env("tokenSecret")!));
    notificationNamespace.use(validateJWT(["customer", "vendor", "admin"], env("tokenSecret")!));

    chat.initialize(chatNamespace, io);
    presence.initialize(presenceNamespace, io);

    // app.use(secureApi);

    app.get("/test", async (req: Request, res: Response) => {
        console.log("Hello From chat");

        res.status(200).json({
            'error': false,
            'message': "External Api",
            'data': "hello World"
        });
    });

    app.use("/api/v1/user", user);
    app.use("/api/v1/chat", chatRoute);

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