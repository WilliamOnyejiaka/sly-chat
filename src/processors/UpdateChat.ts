import { Server } from "socket.io";
import { Job } from "bullmq";
import { Events, Namespaces, WorkerConfig, IWorker, UpdateChatJob, ServiceResultDataType } from "../types/enums";
import { ChatManagementFacade } from "../facade";
import Handler from "../handlers/sockets/Handler";
import { ChatPagination, SocketData } from "../types";

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

        const result = await this.facade.chatService.getUserChats(recipientId, recipientType, 1, 10, ServiceResultDataType.SOCKET) as SocketData;
        const namespace = this.io.of(Namespaces.CHAT);
        if (result.error) {
            namespace.to(recipientSocketId).emit(Events.APP_ERROR, result);
            return;
        }

        namespace.to(recipientSocketId).emit('updateChat', Handler.responseData(200, false, result.message, result.data));
        return;
    }
}