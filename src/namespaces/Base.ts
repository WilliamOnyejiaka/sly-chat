import { Namespace } from "socket.io";
import { ISocket } from "../types";

export default class Base {

    public namespace?: Namespace;
    protected eventHandlers: Record<string, Function> = {};


    public constructor() {

    }

    public register(event: string, handler: Function) {
        this.eventHandlers[event] = handler;
    }

    private initializeEventHandlers(socket: ISocket) {
        for (const [event, handler] of Object.entries(this.eventHandlers)) {
            socket.on(event, handler(socket));
        }
    }

    public initialize(namespace: Namespace) {
        this.namespace = namespace;
        // Handle connections
        this.namespace.on("connection", (socket: ISocket) => {
            this.onConnection(socket);
            this.initializeEventHandlers(socket);
        });
    }

    protected async onConnection(socket: ISocket) {
    }
}
