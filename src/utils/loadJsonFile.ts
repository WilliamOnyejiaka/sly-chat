import * as fs from "fs";
import path from "path";

export default function loadJsonFile(jsonFilePath: string) {
    try {
        const filePath = path.join(__dirname, jsonFilePath);
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        return {
            error: false,
            data: jsonData
        };
    } catch (error) {
        console.error(error);
        return {
            error: true
        };
    }
}