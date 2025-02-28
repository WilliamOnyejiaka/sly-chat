"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const _1 = require(".");
const middlewares_1 = require("./../middlewares");
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const events_1 = require("../events");
const routes_1 = require("../routes");
const enums_1 = require("../types/enums");
function createApp() {
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
    const stream = { write: (message) => _1.logger.http(message.trim()) };
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)("combined", { stream }));
    const chatNamespace = io.of("/chat");
    const presenceNamespace = io.of('/presence');
    const notificationNamespace = io.of(enums_1.Namespace.NOTIFICATION);
    chatNamespace.use((0, middlewares_1.validateJWT)(["customer", "vendor"], (0, _1.env)("tokenSecret")));
    presenceNamespace.use((0, middlewares_1.validateJWT)(["customer", "vendor", "admin"], (0, _1.env)("tokenSecret")));
    notificationNamespace.use((0, middlewares_1.validateJWT)(["customer", "vendor", "admin"], (0, _1.env)("tokenSecret")));
    events_1.chat.initialize(chatNamespace, io);
    events_1.presence.initialize(presenceNamespace, io);
    app.use(middlewares_1.secureApi);
    app.use("/api/v1/user", routes_1.user);
    app.use("/api/v1/chat", routes_1.chat);
    app.post("/test2", (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.status(200).json({
            'error': false,
            'message': "result"
        });
    }));
    app.use(middlewares_1.handleMulterErrors);
    app.use((req, res, next) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        });
    });
    return server;
}
exports.default = createApp;
