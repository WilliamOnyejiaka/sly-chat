
export default class Handler {

    public static responseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return {
            statusCode: statusCode,
            error: error,
            message: message,
            data: data
        };
    }

    public static handleRepoError(repoResult: any) {
        if (repoResult.error) {
            return this.responseData(repoResult.type, true, repoResult.message as string);
        }
        return null;
    }
}