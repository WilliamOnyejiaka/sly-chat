import { Request } from "express";

export default function baseUrl(req: Request) {
    const protocol = req.protocol; // 'http' or 'https'
    const host = req.get("host");
    const fullUrl = `${protocol}://${host}`;
    return fullUrl;
}