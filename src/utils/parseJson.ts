import { logger } from "../config";

export default function parseJson(jsonData: string) {
    try {
        const decodedJson = JSON.parse(jsonData);
        return {
            error: false,
            message: null,
            data: decodedJson
        }
    } catch (error: any) {
        logger.error(error.message);
        return {
            error: true,
            message: error.message,
            data: null
        }
    }
}
