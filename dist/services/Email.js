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
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../config");
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
class Email {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use TLS
            auth: {
                user: 'mirordev@gmail.com', // TODO: add this to env
                pass: (0, config_1.env)('smtpPassword'),
            },
        });
    }
    getEmailTemplate(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, templatePath = path_1.default.join(__dirname, './../views', "email.ejs")) {
            const htmlContent = yield ejs_1.default.renderFile(templatePath, data);
            return htmlContent;
        });
    }
    sendEmail(from, to, subject, html) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: from,
                to: to,
                subject: subject,
                html: html
            };
            try {
                const info = yield this.transporter.sendMail(mailOptions);
                return info;
            }
            catch (error) {
                console.error('Error sending email: ', error);
                return false;
            }
        });
    }
}
exports.default = Email;
