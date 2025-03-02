
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
    NOTIFICATION = '/notification'
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