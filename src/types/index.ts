import { Socket } from "socket.io";

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
export type ServiceResult = {
    json: {
        error: boolean,
        message: string | null,
        data: any
    },
    statusCode: number
};

export type UploadedFiles = {
    publicId: string,
    size: string,
    url: string,
    mimeType: string,
    thumbnail: string | null
};

export type FailedFiles = {
    filename: string,
    error: string
}