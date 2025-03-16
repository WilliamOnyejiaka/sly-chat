import { cloudinary, logger } from "../config";
import BaseService from "./bases/BaseService";
import { http, imageFolders } from "../constants";
import { CdnFolders, ResourceType } from "../types/enums";
import { UploadedFiles, FailedFiles } from "./../types";
import { compressImage } from "../utils";

export default class Cloudinary extends BaseService {

    public constructor() {
        super();
    }

    // private getUrl(publicId: string) {
    //     return cloudinary.url(publicId, {
    //         transformation: [
    //             { fetch_format: 'auto' },
    //             { quality: 'auto' }
    //         ]
    //     });
    // }

    // public async upload(files: Express.Multer.File[], resourceType: ResourceType, folder: CdnFolders) {
    //     const uploadedFiles: UploadedFiles[] = [];
    //     const failedFiles: FailedFiles[] = [];
    //     const publicIds: string[] = [];

    //     await Promise.all(
    //         files.map(async (file) => {
    //             try {
    //                 const buffer = resourceType === ResourceType.IMAGE ? await compressImage(file) : { error: false, buffer: file.buffer };
    //                 if (!buffer.error) {
    //                     const result: any = await new Promise((resolve, reject) => {
    //                         const stream = cloudinary.uploader.upload_stream(
    //                             { resource_type: resourceType, folder: folder, timeout: 100000 },
    //                             (error, result) => {
    //                                 if (error) reject(error);
    //                                 else resolve(result);
    //                             }
    //                         );
    //                         stream.end(buffer.buffer);
    //                     });
    //                     const url = resourceType === ResourceType.IMAGE ? this.getUrl(result.public_id) : result.url;
    //                     result.url = url;
    //                     uploadedFiles.push({
    //                         publicId: result.public_id,
    //                         size: String(result.bytes),
    //                         url: result.url,
    //                         mimeType: file.mimetype,
    //                         thumbnail: 
    //                     });
    //                     publicIds.push(result.public_id);
    //                 } else {
    //                     failedFiles.push({ filename: file.originalname, error: "Failed to compress image." });
    //                 }
    //             } catch (error: any) {
    //                 console.error(`Upload failed for ${file.originalname}:`, error);
    //                 failedFiles.push({ filename: file.originalname, error: error.message });
    //             }
    //         })
    //     );

    //     return { uploadedFiles, failedFiles, publicIds }
    // }

    public async generateVideoThumbnail(publicId: string, timestamp: number = 5) {
        try {
            const thumbnailUrl = cloudinary.url(publicId, {
                resource_type: "video",
                transformation: [{ start_offset: timestamp, format: "jpg" }]
            });

            return super.httpResponseData(200, false, null, { thumbnailUrl });
        } catch (error: any) {
            logger.error(`Error generating video thumbnail: ${error.message}`);
            return super.httpResponseData(500, true, http('500')!);
        }
    }

    private getUrl(publicId: string, resourceType: ResourceType, options: any = {}) {
        return cloudinary.url(publicId, {
            transformation: resourceType === ResourceType.VIDEO
                ? [{ start_offset: options.timestamp || 1, format: "jpg" }] // Extracts a frame at a given timestamp
                : [{ fetch_format: 'auto' }, { quality: 'auto' }]
        });
    }

    public async upload(files: Express.Multer.File[], resourceType: ResourceType, folder: CdnFolders) {
        const uploadedFiles: UploadedFiles[] = [];
        const failedFiles: FailedFiles[] = [];
        const publicIds: string[] = [];

        await Promise.all(
            files.map(async (file) => {
                try {
                    const buffer = resourceType === ResourceType.IMAGE ? await compressImage(file) : { error: false, buffer: file.buffer };
                    if (!buffer.error) {
                        const result: any = await new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { resource_type: resourceType, folder: folder, timeout: 100000 },
                                (error, result) => {
                                    if (error) reject(error);
                                    else resolve(result);
                                }
                            );
                            stream.end(buffer.buffer);
                        });

                        let thumbnail = null;
                        if (resourceType === ResourceType.VIDEO) {
                            const videoDetails = await cloudinary.api.resource(result.public_id, { resource_type: "video" });
                            const duration = videoDetails.duration || 0;

                            // Choose a safe timestamp
                            const timestamp = duration >= 5 ? 5 : Math.max(0, duration / 2);
                            thumbnail = this.getUrl(result.public_id, ResourceType.VIDEO, { timestamp });
                        }

                        const url = resourceType === ResourceType.IMAGE ? this.getUrl(result.public_id, resourceType) : result.url;

                        result.url = url;
                        uploadedFiles.push({
                            publicId: result.public_id,
                            size: String(result.bytes),
                            url: result.url,
                            mimeType: file.mimetype,
                            thumbnail: thumbnail
                        });
                        publicIds.push(result.public_id);
                    } else {
                        failedFiles.push({ filename: file.originalname, error: "Failed to compress image." });
                    }
                } catch (error: any) {
                    console.error(`Upload failed for ${file.originalname}:`, error);
                    failedFiles.push({ filename: file.originalname, error: error.message });
                }
            })
        );

        return { uploadedFiles, failedFiles, publicIds };
    }


    public async deleteFiles(publicIds: string[]) {
        try {
            const result = await cloudinary.api.delete_resources(publicIds);
            return result;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // public async uploadImage(filePath: string, imageFolder: string) {

    //     let uploadResult = null;
    //     let folder = imageFolders(imageFolder);

    //     try {
    //         uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: "auto", folder: folder });
    //     } catch (error: any) {
    //         logger.error(`Error uploading file: ${error.message}`, { filePath, imageFolder });
    //         return super.httpResponseData(500, true, http('500')!);
    //     }

    //     const url = this.getUrl(uploadResult.public_id);

    //     return super.httpResponseData(201, false, null, {
    //         imageData: uploadResult,
    //         url
    //     });
    // }

    public async updateImage(filePath: string, publicID: string) {
        try {
            const uploadResult = await cloudinary.uploader.upload(filePath, {
                public_id: publicID,
                overwrite: true // Ensures the image is replaced
            });
            const url = this.getUrl(uploadResult.public_id, ResourceType.IMAGE);

            return super.httpResponseData(201, false, null, {
                imageData: uploadResult,
                url
            });
        } catch (error: any) {
            logger.error(`Error updating file: ${error.message}`, { filePath });
            return super.httpResponseData(500, true, http('500')!);
        }
    }

    private fileOptions(type: string) {
        const resourceMap: Record<string, object> = {
            'image': {},
            'audio': { resource_type: "video" },
            'video': { resource_type: "video" },
        };
        return resourceMap[type] || {};
    }

    public async delete(publicID: string, type: string = "image") {
        const options = this.fileOptions(type);

        try {
            const response = await cloudinary.uploader.destroy(publicID, options);
            if (response.result == "ok") {
                return super.httpResponseData(200, false, "File has been deleted")
            }
            return super.httpResponseData(404, true, "File not found");
        } catch (error: any) {
            logger.error(`Error deleting file: ${error.message}`);
            return super.httpResponseData(500, true, http('500')!);
        }
    }
}
