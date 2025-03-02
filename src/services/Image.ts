import BaseService from "./bases/BaseService";
import { http } from "../constants";
import { compressImage } from "../utils";
import * as fs from "fs";
import ImageRepo from "../repos/bases/ImageRepo";
import { logger } from "../config";
import { Cloudinary } from ".";
import { UploadedImageData, UploadResult } from "../types";

const bytesToKB = (bytes: number) => (bytes / 1024).toFixed(2); // Converts bytes to KB
const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2); // Converts bytes to MB

export default class ImageService extends BaseService {

    private readonly cloudinary = new Cloudinary();


    public constructor() {
        super();
    }

    public async deleteFiles(
        files: (Express.Multer.File | string)[]
    ): Promise<boolean> {
        const deletionPromises = files.map(file => {
            const filePath = typeof file === 'string' ? file : file.path;
            const fieldname = typeof file === 'string' ? undefined : file.fieldname;

            return fs.promises
                .unlink(filePath)
                .then(() => ({ success: true, path: filePath, fieldname }))
                .catch(error => ({ success: false, path: filePath, fieldname, error }));
        });

        const results = await Promise.all(deletionPromises);

        const errors = results.filter(result => !result.success);
        if (errors.length > 0) {
            logger.error(`Failed to delete some files: ${JSON.stringify(errors)}`);
            return true; // Indicate that there were errors
        }
        return false; // All deletions succeeded
    }

    public async processAndUpload(image: Express.Multer.File, imageFolder: string) {
        const result = await compressImage(image);

        if (result.error) {
            return super.httpResponseData(
                500,
                true,
                http("500")!,
            );
        }

        const deleted = await this.deleteFiles([image]);
        if (deleted) {
            return super.httpResponseData(500, true, http('500')!);
        }

        const uploadResult = await this.cloudinary.uploadImage("dsd", imageFolder);
        const deletedCompressedImage = await this.deleteFiles(["SDfdcfsd"]);
        if (deletedCompressedImage) {
            return super.httpResponseData(500, true, http('500')!);
        }
        return uploadResult;
    }

    public async uploadImages(images: Express.Multer.File[], uploadFolders: any): Promise<UploadResult> {
        try {
            // Parallelize image uploads
            const uploadPromises = images.map(async (image) => {
                const fieldName = image.fieldname;
                const uploadFolder = uploadFolders[fieldName];

                const uploadResult = await this.processAndUpload(image, uploadFolder);

                if (uploadResult.json.error) {
                    return {
                        success: false,
                        fieldName,
                        message: `Failed to upload ${fieldName}: ${uploadResult.json.message}`,
                    };
                }

                return {
                    success: true,
                    fieldName,
                    data: {
                        mimeType: uploadResult.json.data.imageData.format,
                        imageUrl: uploadResult.json.data.url,
                        publicId: uploadResult.json.data.imageData.public_id,
                        size: uploadResult.json.data.imageData.bytes,
                    },
                };
            });

            // Wait for all uploads to complete
            const results = await Promise.all(uploadPromises);

            // Separate successful uploads and errors
            const successfulUploads = results.filter((result) => result.success) as {
                success: true;
                fieldName: string;
                data: UploadedImageData;
            }[];

            const errors = results.filter((result) => !result.success) as {
                success: false;
                fieldName: string;
                message: string;
            }[];

            // Construct the storeImages object
            const uploadedImages = successfulUploads.reduce((acc, { fieldName, data }) => {
                acc[fieldName] = data;
                return acc;
            }, {} as Record<string, UploadedImageData>);

            if (errors.length > 0) {
                return {
                    success: false,
                    data: uploadedImages,
                    error: errors.map((e) => ({ fieldName: e.fieldName, message: e.message })),
                };
            }

            return { success: true, data: uploadedImages };
        } catch (error: any) {
            console.log(error);
            return {
                success: false,
                error: [{ fieldName: "unknown", message: error.message || "An unexpected error occurred" }],
            };
        }
    }

    public async uploadImage<T extends ImageRepo>(image: Express.Multer.File, parentId: number, repo: T, imageFolder: string) {
        const imageExists = await repo.getImage(parentId);
        if (imageExists.error) {
            await this.deleteFiles([image]);
            return super.httpResponseData(imageExists.type, true, imageExists.message!);
        }

        if (imageExists.data) {
            await this.deleteFiles([image]);
            return super.httpResponseData(400, true, "A record with this data already exists.");
        }

        const uploadResult = await this.processAndUpload(image, imageFolder);

        if (uploadResult.json.error) {
            return uploadResult;
        }

        const repoResult = await repo.insertImage({
            mimeType: uploadResult.json.data.imageData.format,
            imageUrl: uploadResult.json.data.url,
            publicId: uploadResult.json.data.imageData.public_id,
            size: uploadResult.json.data.imageData.bytes,
            parentId: parentId
        }); // ! TODO: Incase this fails delete from cloudinary

        return !repoResult.error ?
            super.httpResponseData(
                201,
                false,
                "Image was uploaded successfully",
                { imageUrl: uploadResult.json.data.url }
            ) :
            super.httpResponseData(repoResult.type, true, repoResult.message as string);
    }

    public async deleteCloudinaryImage(publicID: string) {
        return await this.cloudinary.delete(publicID);
    }

}