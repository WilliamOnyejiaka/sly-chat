import sharp from "sharp";
import { logger } from "../config";

export default async function compressImage(image: Express.Multer.File) {
    try {
        const buffer = await sharp(image.buffer)
            .resize({
                height: 800, width: 800, fit: 'cover',
            })
            .webp({
                // lossless: true,
                quality: 80
            })
            .toBuffer()

        return { error: false, buffer };
    } catch (error) {
        logger.error(`Error processing the image: ${error}`);
        return {
            error: true,
            buffer: null
        }
    }
}
