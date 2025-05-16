import { Server } from "socket.io";
import { Job } from "bullmq";
import { Events, Namespace, WorkerConfig, IWorker, UpdateChatJob } from "../types/enums";
import { ChatManagementFacade } from "../facade";
import Handler from "../handlers/sockets/Handler";
import { ChatPagination } from "../types";

export class UpdateChat implements IWorker<UpdateChatJob> {

    private io: Server;
    public config: WorkerConfig;
    public queueName = 'update-chat';
    public facade: ChatManagementFacade = new ChatManagementFacade();

    public constructor(config: WorkerConfig, io: Server) {
        this.io = io;
        this.config = config
    }

    public async process(job: Job<UpdateChatJob>) {
        const { recipientSocketId, recipientId, recipientType } = job.data;
        const pagination: ChatPagination = {
            page: 1,
            limit: 10,
            message: {
                page: 1,
                limit: 10
            }
        };
        const allChats = await this.facade.socketGetUserChats(recipientId, recipientType, pagination); // TODO: handle this
        const namespace = this.io.of(Namespace.CHAT);
        if (allChats.error) {
            namespace.to(recipientSocketId).emit('appError', allChats);
            return;
        }

        namespace.to(recipientSocketId).emit('updateChat', Handler.responseData(200, false, allChats.message, allChats.data));
    }
}