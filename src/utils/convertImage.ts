import sharp from "sharp";
import * as fs from "fs";
import { http } from "../constants";

export default async function convertImage(
    fileName: string,
    filePath: string,
    outputPath: string,
    mimetype: string
) {
    try {
        await sharp(filePath).toFile(outputPath);

        const fileData = fs.readFileSync(outputPath);
        // const base64Data = `data:${mimetype};base64,` + fileData.toString("base64"); //TODO: check this later
        const base64Data = fileData.toString("base64");


        if (fs.existsSync(filePath) && fs.existsSync(outputPath)) {
            try {
                await fs.promises.unlink(outputPath);
                await fs.promises.unlink(filePath);

                return {
                    error: false,
                    data: base64Data
                };
            } catch (error) {
                console.error("Error deleting a the files: ");
                return {
                    error: true,
                    message: http("500")!
                }
            }
        } else {
            return {
                error: true,
                message: `File ${fileName} not found.`
            };
        }
    } catch (err) {
        return {
            error: true,
            message: "Error compressing image."
        };
    }
}