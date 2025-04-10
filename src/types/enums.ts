import { Job } from "bullmq";

export enum UserType {
    Admin = "admin",
    Vendor = "vendor",
    Customer = "customer",
};

export enum Events {
    APP_ERROR = "appError",

}
export enum Namespace {
    CHAT = '/chat',
    PRESENCE = '/presence',
    NOTIFICATION = '/notification',
    SUPPORTCHAT = '/supportChat'
}

export enum ServiceResultDataType {
    HTTP = 'http',
    SOCKET = 'socket'
}

export enum ResourceType {
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "video",
    PDF = "raw",
    AUTO = "auto"
};

export enum CdnFolders {
    PDF = "chat-cdn/chat-pdfs",
    IMAGE = "chat-cdn/chat-images",
    VIDEO = "chat-cdn/chat-videos",
    AUDIO = "chat-cdn/chat-audios"
};

export enum AdminPermission {
    MANAGE_ALL = "manage_all",
    MANAGE_ADMINS = "manage_admins",
    MANAGE_USERS = "manage_users",
    MANAGE_VENDORS = "manage_vendors",
    MANAGE_USERS_PARTIAL = "manage_users_partial",
    MANAGE_VENDORS_PARTIAL = "manage_vendors_partial",
    VIEW_REPORTS = "view_reports",
    MANAGE_CONTENT = "manage_content",
    MANAGE_FINANCE = "manage_finance",
    MANAGE_SUPPORT = "manage_support",
    MANAGE_HR = "manage_hr",
    MANAGE_IT = "manage_it",
    ENSURE_COMPLIANCE = "ensure_compliance",
    VENDOR_PORTAL_ACCESS = "vendor_portal_access",
    ANY = "any"
};

export interface IWorker<T> {
    process: (job: Job<T>) => Promise<void>,
    completed?: (job: Job<any, void, string>, result: void, prev: string) => void,
    failed?: (job: Job<any, void, string> | undefined, error: Error, prev: string) => void,
    drained?: () => void,
    config: WorkerConfig,
    queueName: string
}

export interface SendMessageJob {
    socketId: string
}

export interface UpdateChatJob {
    recipientSocketId: string,
    recipientId: number,
    recipientType: UserType
}


export interface WorkerConfig { connection: { url: string }, concurrency?: number, limiter?: { max: number, duration: number } };