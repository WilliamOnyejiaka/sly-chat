"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twilio_1 = require("twilio");
const env_1 = __importDefault(require("./env"));
const accountSid = (0, env_1.default)('twilioAccountSID');
const authToken = (0, env_1.default)('twilioAuthToken');
const twilioClient = new twilio_1.Twilio(accountSid, authToken);
exports.default = twilioClient;
