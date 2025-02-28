"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = env;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function env(key) {
    var _a;
    return {
        'port': process.env.PORT,
        'secretKey': process.env.SECRET_KEY,
        'envType': (_a = process.env.ENV_TYPE) !== null && _a !== void 0 ? _a : "prod",
        'databaseURL': process.env.DATABASE_URL,
        'tokenSecret': process.env.TOKEN_SECRET,
        'redisURL': process.env.REDIS_URL,
        'oAuthClientID': process.env.OAUTH_CLIENT_ID,
        'oAuthClientSecret': process.env.OAUTH_CLIENT_SECRET,
        'oAuthCallbackUrl': process.env.OAUTH_CALLBACK_URL,
        'frontendRedirect': process.env.FRONTEND_REDIRECT,
        'storedSalt': process.env.STORED_SALT,
        'smtpPassword': process.env.SMTP_PASSWORD,
        'apiKey': process.env.API_KEY,
        'defaultAdminPassword': process.env.DEFAULT_ADMIN_PASSWORD,
        'defaultAdminEmail': process.env.DEFAULT_ADMIN_EMAIL,
        'cloudinaryCloudName': process.env.CLOUDINARY_CLOUD_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryApiSecret': process.env.CLOUDINARY_API_SECRET,
        'twilioAccountSID': process.env.TWILIO_ACCOUNT_SID,
        'twilioAuthToken': process.env.TWILIO_AUTH_TOKEN,
        'twilioPhoneNumber': process.env.TWILIO_PHONE_NUMBER
    }[key];
}
