"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os = __importStar(require("os"));
const app_1 = __importDefault(require("./config/app"));
const config_1 = require("./config");
const app = (0, app_1.default)();
let environmentType = (0, config_1.env)('envType');
const PORT = (0, config_1.env)('port');
function startServer() {
    const numCpu = os.cpus().length;
    if (cluster_1.default.isPrimary) {
        for (let i = 0; i < numCpu; i++) {
            cluster_1.default.fork();
        }
        cluster_1.default.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            cluster_1.default.fork();
        });
    }
    else {
        app.listen(PORT, () => {
            console.log(`pid - ${process.pid}`);
            console.log(`server running on port - ${PORT}\n`);
        });
    }
}
if (environmentType == "dev") {
    app.listen(PORT, () => console.log(`server running on port - ${PORT}`));
}
else {
    startServer();
}
