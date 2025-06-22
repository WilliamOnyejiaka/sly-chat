import { Server } from "socket.io";
import { Job } from "bullmq";
import { Events, Namespaces, WorkerConfig, IWorker } from "../types/enums";
import { ChatManagementFacade } from "../facade";
import Handler from "../handlers/sockets/Handler";
import { ChatPagination } from "../types";
import { MessagesCache } from "../cache";
import { logger } from "../config";

export interface UpdateMessagesJob {
    messages: any[],
    room: string
}

export class UpdateMessages implements IWorker<UpdateMessagesJob> {

    private io: Server;
    public config: WorkerConfig;
    public queueName = 'update-messages';
    public facade: ChatManagementFacade = new ChatManagementFacade();

    public constructor(config: WorkerConfig, io: Server) {
        this.io = io;
        this.config = config
    }

    public async process(job: Job<UpdateMessagesJob>) {
        const { messages, room } = job.data;

        const messageCache = new MessagesCache();
        const cacheMessages = messages.map(message => JSON.stringify(message));

        if (await messageCache.cacheMessages(room, cacheMessages)) {
            logger.info(`📥 The messages for room:${room} was successfully cached`);
        } else logger.info(`🛑 The messages for room:${room} was not cached`);
    }
}