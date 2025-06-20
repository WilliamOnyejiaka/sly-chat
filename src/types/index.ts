import { Socket, Server } from "socket.io";
import { Job } from 'bullmq';

export interface UploadedImageData {
    mimeType: string;
    imageUrl: string;
    publicId: string;
    size: number;
}

export interface UploadResult {
    success: boolean;
    data?: Record<string, UploadedImageData>;
    error?: { fieldName: string; message: string }[];
}

export interface ISocket extends Socket {
    locals?: any
}

export type ServiceData = { error: boolean, message: string | null, statusCode: number, data: any };
export type HttpData = {
    json: {
        error: boolean,
        message: string | null,
        data: any
    },
    statusCode: number
};

export interface SocketData {
    statusCode: number,
    error: boolean,
    message: string | null,
    data?: any
};

export type UploadedFiles = {
    publicId: string,
    size: string,
    url: string,
    mimeType: string,
    thumbnail: string | null,
    duration: string | null
};

export type FailedFiles = {
    filename: string,
    error: string
};

export interface JobProcessor<T> {
    process(job: Job<T, any, string>): Promise<void>;
}

export interface EventHandler {
    (event: any, stream: string, id: string, io?: Server): Promise<void>;
}

export interface StreamGroup {
    stream: string; // e.g., 'stream:profile'
    consumerGroup: string; // e.g., 'profile-consumers'
    handlers: Map<string, EventHandler>; // e.g., 'ProfileUpdated' -> handler
}

export interface ChatPagination {
    page: number,
    limit: number,
    message: MessagePagination
}

export interface MessagePagination {
    page: number,
    limit: number,
}

export interface ChatLimit {
    skip: number,
    take: number,
    message: MessageLimit
}

export interface MessageLimit {
    skip: number,
    take: number,
}