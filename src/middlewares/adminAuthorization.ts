import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { env } from "../config";


const adminAuthorization = (requiredPermissions: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <TOKEN>"
        const response = await axios.post(`${env('mainApi')!}/validate-admin`, { requiredPermissions },
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Set the Bearer Token in headers
                    // "x-api-key": req.headers['x-api-key'] TODO: Just for the future
                },
            }
        );
        const data = response.data;
        if (data.error) {
            res.status(response.status).json(data);
            return;
        }
        res.locals.data = data.data;
        next();

    } catch (error) {
        console.error("Admin auth error:", error);

        // Handle Axios errors properly
        if (axios.isAxiosError(error)) {
            const data = error.response?.data;
            res.status(error.response?.status || 500).json({
                message: data?.message || "Authorization service error",
                error: true,
                data: {}
            });
            return;
        }

        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

export default adminAuthorization;