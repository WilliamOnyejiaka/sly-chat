import { logger } from "../../../config";
import { ServiceData } from "../../../types";

export default class Base {

    public responseData(statusCode: number, error: boolean, message: string | null = null, data: any = {}) {
        return {
            statusCode: statusCode,
            error: error,
            message: message,
            data: data
        };
    }

    public handleRepoError(repoResult: any) {
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message as string);
        }
        return null;
    }

    public handleServiceResultError(message: string, servicesResult: ServiceData) {
        logger.error(message);
        return this.responseData(servicesResult.statusCode, servicesResult.error, servicesResult.message);
    }
}