import { config } from "dotenv";

config();

// type ConfigKeys =
//     | 'PORT'
//     | 'SECRET_KEY'
//     | 'ENV_TYPE'
//     | 'DATABASE_URL'
//     | 'TOKEN_SECRET'
//     | 'REDIS_URL'
//     | 'OAUTH_CLIENT_ID'
//     | 'OAUTH_CLIENT_SECRET'
//     | 'OAUTH_CALLBACK_URL'
//     | 'FRONTEND_REDIRECT'
//     | 'STORED_SALT'
//     | 'SMTP_PASSWORD'
//     | 'API_KEY'
//     | 'DEFAULT_ADMIN_PASSWORD'
//     | 'DEFAULT_ADMIN_EMAIL'
//     | 'CLOUDINARY_CLOUD_NAME'
//     | 'CLOUDINARY_API_KEY'
//     | 'CLOUDINARY_API_SECRET'
//     | 'TWILIO_ACCOUNT_SID'
//     | 'TWILIO_AUTH_TOKEN'
//     | 'TWILIO_PHONE_NUMBER'
//     | 'MAIN_API';

// const Config: Record<ConfigKeys, string> = {
//     PORT: getEnv('PORT'),
//     SECRET_KEY: getEnv('SECRET_KEY'),
//     ENV_TYPE: process.env.ENV_TYPE ?? 'prod',
//     DATABASE_URL: getEnv('DATABASE_URL'),
//     TOKEN_SECRET: getEnv('TOKEN_SECRET'),
//     REDIS_URL: getEnv('REDIS_URL'),
//     OAUTH_CLIENT_ID: getEnv('OAUTH_CLIENT_ID'),
//     OAUTH_CLIENT_SECRET: getEnv('OAUTH_CLIENT_SECRET'),
//     OAUTH_CALLBACK_URL: getEnv('OAUTH_CALLBACK_URL'),
//     FRONTEND_REDIRECT: getEnv('FRONTEND_REDIRECT'),
//     STORED_SALT: getEnv('STORED_SALT'),
//     SMTP_PASSWORD: getEnv('SMTP_PASSWORD'),
//     API_KEY: getEnv('API_KEY'),
//     DEFAULT_ADMIN_PASSWORD: getEnv('DEFAULT_ADMIN_PASSWORD'),
//     DEFAULT_ADMIN_EMAIL: getEnv('DEFAULT_ADMIN_EMAIL'),
//     CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
//     CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
//     CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
//     TWILIO_ACCOUNT_SID: getEnv('TWILIO_ACCOUNT_SID'),
//     TWILIO_AUTH_TOKEN: getEnv('TWILIO_AUTH_TOKEN'),
//     TWILIO_PHONE_NUMBER: getEnv('TWILIO_PHONE_NUMBER'),
//     MAIN_API: getEnv('MAIN_API')
// };

// function getEnv(key: string): string {
//     const value = process.env[key];
//     if (value === undefined) {
//         throw new Error(`Missing environment variable: ${key}`);
//     }
//     return value;
// }


export default function env(key: string) {
    return {
        'port': process.env.PORT!,
        'secretKey': process.env.SECRET_KEY!,
        'envType': process.env.ENV_TYPE ?? "prod",
        'databaseURL': process.env.DATABASE_URL!,
        'tokenSecret': process.env.TOKEN_SECRET!,
        'redisURL': process.env.REDIS_URL!,
        'oAuthClientID': process.env.OAUTH_CLIENT_ID!,
        'oAuthClientSecret': process.env.OAUTH_CLIENT_SECRET!,
        'oAuthCallbackUrl': process.env.OAUTH_CALLBACK_URL!,
        'frontendRedirect': process.env.FRONTEND_REDIRECT!,
        'storedSalt': process.env.STORED_SALT!,
        'smtpPassword': process.env.SMTP_PASSWORD!,
        'apiKey': process.env.API_KEY!,
        'defaultAdminPassword': process.env.DEFAULT_ADMIN_PASSWORD!,
        'defaultAdminEmail': process.env.DEFAULT_ADMIN_EMAIL!,
        'cloudinaryCloudName': process.env.CLOUDINARY_CLOUD_NAME!,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY!,
        'cloudinaryApiSecret': process.env.CLOUDINARY_API_SECRET!,
        'twilioAccountSID': process.env.TWILIO_ACCOUNT_SID!,
        'twilioAuthToken': process.env.TWILIO_AUTH_TOKEN!,
        'twilioPhoneNumber': process.env.TWILIO_PHONE_NUMBER!,
        'mainApi': process.env.MAIN_API!
    }[key];
}