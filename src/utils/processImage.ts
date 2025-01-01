import mime from "mime";
import { convertImage } from ".";


export default async function processImage(image: Express.Multer.File) {
    const filePath = image.path;
    const outputPath = `compressed/${image.filename}`;
    const mimeType = mime.lookup(filePath);
    const fileName = image.filename;

    return await convertImage(fileName, filePath, outputPath, mimeType);
}