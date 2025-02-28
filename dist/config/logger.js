"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        http: 3,
        info: 4,
        debug: 5,
        trace: 6,
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        http: 'cyan',
        info: 'green',
        debug: 'blue',
        trace: 'magenta',
    },
};
const generalFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`));
const logger = winston_1.default.createLogger({
    levels: customLevels.levels,
    format: generalFormat,
    transports: [
        // Console transport with colorized output
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)),
        }),
        // File transport without colors
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../logs/error.log'),
            level: 'error'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../logs/http.log'),
            level: 'http'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../logs/warn.log'),
            level: 'warn'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../logs/info.log'),
            level: 'info'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../logs/fatal.log'),
            level: 'fatal'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../logs/debug.log'),
            level: 'debug'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../logs/trace.log'),
            level: 'trace'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(__dirname, '../logs/app.log') // Combined errors
        }),
    ],
});
// Add custom colors
winston_1.default.addColors(customLevels.colors);
exports.default = logger;
