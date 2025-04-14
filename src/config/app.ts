// app.ts
import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { cloudinary, corsConfig, env, logger } from ".";
import { validateJWT, validateUser, handleMulterErrors, secureApi, redisClientMiddleware, vendorIsActive, uploads, validateHttpJWT, adminAuthorization } from "./../middlewares";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';
import { chat, presence, supportChat } from "../events";
import { ISocket } from "../types";
import { user, chat as chatRoute, comment, general } from "../routes";
import { Namespace, IWorker } from "../types/enums";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { setupWorker } from "@socket.io/sticky";
import cluster from "cluster";
import compression from 'compression';
import prisma from "../repos";
import { marked } from 'marked';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Queue, Worker, Job } from 'bullmq';
import { parse } from 'url';
import { SendMessageProcessor } from "../processors";
import { UpdateChat } from "../processors/UpdateChat";
import { loadMD } from "./../utils";
import initializeIO from "./io";

async function createApp() {
    const app: Application = express();
    const server = http.createServer(app);

    const pubClient = createClient({ url: env('redisURL')! });
    const subClient = pubClient.duplicate();
    const io = await initializeIO(server, pubClient, subClient);
    const stream = { write: (message: string) => logger.http(message.trim()) };

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(compression());
    app.use(morgan("combined", { stream }));
    app.use(express.static(path.join(__dirname, './../../public')));
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    const IWorkers: IWorker<any>[] = [
        new SendMessageProcessor({ connection: { url: env('redisURL')! } }, io),
        new UpdateChat({ connection: { url: env('redisURL')! } }, io),
    ];

    for (const IWorker of IWorkers) {
        const worker = new Worker(IWorker.queueName, IWorker.process.bind(IWorker), IWorker.config);
        if (IWorker.completed) worker.on('completed', IWorker.completed);
        if (IWorker.failed) worker.on('failed', IWorker.failed);
        if (IWorker.drained) worker.on('completed', IWorker.drained);
    }


    const chatNamespace = io.of(Namespace.CHAT);
    const presenceNamespace = io.of(Namespace.PRESENCE);
    const supportChatNamespace = io.of(Namespace.SUPPORTCHAT);
    const notificationNamespace = io.of(Namespace.NOTIFICATION);

    chatNamespace.use(validateJWT(["customer", "vendor"], env("tokenSecret")!));
    presenceNamespace.use(validateJWT(["customer", "vendor", "admin"], env("tokenSecret")!));
    notificationNamespace.use(validateJWT(["customer", "vendor", "admin"], env("tokenSecret")!));

    chat.initialize(chatNamespace, io);
    presence.initialize(presenceNamespace, io);
    supportChat.initialize(supportChatNamespace, io);

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.io = io;
        next();
    });

    // app.use(secureApi);

    // Health check endpoint
    app.get("/health", async (req: Request, res: Response) => {
        try {
            // Check Redis connectivity
            const redisPing = await pubClient.ping();
            const redisConnected = redisPing === 'PONG';

            // Get Socket.IO connection counts per namespace
            const chatConnections = (await chatNamespace.fetchSockets()).length;
            const presenceConnections = (await presenceNamespace.fetchSockets()).length;
            const supportConnections = (await supportChatNamespace.fetchSockets()).length;
            const notificationConnections = (await notificationNamespace.fetchSockets()).length;

            // Server health metrics
            const healthStatus = {
                status: 'healthy',
                workerId: process.pid,
                environment: env('envType'),
                uptime: process.uptime(), // in seconds
                memoryUsage: process.memoryUsage(), // in bytes
                cpuUsage: process.cpuUsage(), // in microseconds
                connections: {
                    total: io.engine.clientsCount,
                    namespaces: {
                        chat: chatConnections,
                        presence: presenceConnections,
                        supportChat: supportConnections,
                        notification: notificationConnections
                    }
                },
                redis: {
                    connected: redisConnected,
                    stats: redisConnected ? await pubClient.info('stats') : 'disconnected'
                },
                timestamp: new Date().toISOString()
            };

            res.status(200).json({
                error: false,
                message: "Health check successful",
                data: healthStatus
            });
        } catch (error) {
            console.error(`Worker ${process.pid} - Health check error:`, error);
            res.status(503).json({
                error: true,
                message: "Health check failed",
                data: {
                    status: 'unhealthy',
                    workerId: process.pid,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            });
        }
    });

    app.use(general);
    app.use("/api/v1/user", user);
    app.use("/api/v1/chat", validateHttpJWT(["customer", "vendor"], env("tokenSecret")!), chatRoute);
    app.use("/api/v1/comment", validateHttpJWT(["customer", "vendor"], env("tokenSecret")!), comment);

    app.post("/test2", adminAuthorization(['support']), async (req: Request, res: Response) => {
        res.status(200).json({
            'error': false,
            'message': "result",
            data: res.locals.data
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

    // Graceful shutdown handling
    const shutdown = async () => {
        try {
            await prisma.$disconnect();
            await Promise.all([
                pubClient.quit(),
                subClient.quit()
            ]);
            server.close(() => {
                console.log(`Worker ${process.pid} shutdown complete`);
                process.exit(0);
            });
        } catch (err) {
            console.error(`Worker ${process.pid} - Shutdown error:`, err);
            process.exit(1);
        }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
}


export default createApp;