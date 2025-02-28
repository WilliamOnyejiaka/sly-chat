"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Base {
    constructor() {
        this.eventHandlers = {};
    }
    register(event, handler) {
        this.eventHandlers[event] = handler;
    }
    initializeEventHandlers(socket) {
        for (const [event, handler] of Object.entries(this.eventHandlers)) {
            socket.on(event, (...args) => handler(this.io, socket, ...args));
        }
    }
    onConnection(callback) {
        this.onConnectionCallback = callback;
    }
    initialize(namespace, io) {
        this.namespace = namespace;
        this.io = io;
        this.namespace.on("connection", (socket) => {
            if (this.onConnectionCallback) {
                this.onConnectionCallback(io, socket);
            }
            this.initializeEventHandlers(socket);
        });
    }
}
exports.default = Base;
