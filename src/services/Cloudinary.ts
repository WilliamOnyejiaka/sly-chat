import { cloudinary, logger } from "../config";
import BaseService from "./bases/BaseService";
import { http, imageFolders } from "../constants";

export default class Cloudinary extends BaseService {

    public constructor() {
        super();
    }

    private getUrl(publicId: string) {
        return cloudinary.url(publicId, {
            transformation: [
                { fetch_format: 'auto' },
                { quality: 'auto' }
            ]
        });
    }

    public async uploadImage(filePath: string, imageFolder: string) {

        let uploadResult = null;
        let folder = imageFolders(imageFolder);

        try {
            uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: "auto", folder: folder });
        } catch (error: any) {
            logger.error(`Error uploading file: ${error.message}`, { filePath, imageFolder });
            return super.responseData(500, true, http('500')!);
        }

        const url = this.getUrl(uploadResult.public_id);

        return super.responseData(201, false, null, {
            imageData: uploadResult,
            url
        });
    }

    public async updateImage(filePath: string, publicID: string) {
        try {
            const uploadResult = await cloudinary.uploader.upload(filePath, {
                public_id: publicID,
                overwrite: true // Ensures the image is replaced
            });
            const url = this.getUrl(uploadResult.public_id);

            return super.responseData(201, false, null, {
                imageData: uploadResult,
                url
            });
        } catch (error: any) {
            logger.error(`Error updating file: ${error.message}`, { filePath });
            return super.responseData(500, true, http('500')!);
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
                return super.responseData(200, false, "File has been deleted")
            }
            return super.responseData(404, true, "File not found");
        } catch (error: any) {
            logger.error(`Error deleting file: ${error.message}`);
            return super.responseData(500, true, http('500')!);
        }
    }
}
