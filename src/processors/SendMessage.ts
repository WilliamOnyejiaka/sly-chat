import { Server } from "socket.io";
import { Job } from "bullmq";
import { Events, Namespaces, WorkerConfig, IWorker, SendMessageJob } from "../types/enums";

export class SendMessageProcessor implements IWorker<SendMessageJob> {

    private io: Server;
    public config: WorkerConfig;
    public queueName = 'send-message';

    public constructor(config: WorkerConfig, io: Server) {
        this.io = io;
        this.config = config
    }

    public async process(job: Job<SendMessageJob>) {
        const { socketId } = job.data;
        const socket = this.io.sockets.sockets.get(socketId)!;
        console.log("Hello - ", socketId);
        this.io.of(Namespaces.CHAT).to(socketId).emit(Events.APP_ERROR, { message: "Hello" })
    }
}