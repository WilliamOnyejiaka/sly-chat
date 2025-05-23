import { UserType } from "@prisma/client";
import constants from "../../constants";
import Repo from "../../repos/bases/Repo";
import { ChatLimit, ChatPagination, HttpData, MessageLimit, MessagePagination } from "../../types";
import { ServiceResultDataType } from "../../types/enums";
import { getPagination } from "../../utils";
import UserRepo from "../../repos/bases/UserRepo";

export default class BaseService<T extends Repo = Repo> {

    protected readonly repo?: T;

    constructor(repo?: T) {
        this.repo = repo;
    }

    protected skipAndTake(page: number, limit: number) {
        const skip = (page - 1) * limit;
        const take = limit;
        return { skip, take }
    }

    protected chatLimit(pagination: ChatPagination): ChatLimit {
        const chatLimit: ChatLimit = {
            ...this.skipAndTake(pagination.page, pagination.limit),
            message: { ...this.skipAndTake(pagination.message.page, pagination.message.limit) }
        }
        return chatLimit;
    }

    protected messageLimit(pagination: MessagePagination): MessageLimit {
        const messageLimit: MessageLimit = {
            ...this.skipAndTake(pagination.page, pagination.limit),
        }
        return messageLimit;
    }

    public sanitizeUserData(data: any, userType: UserType, repo: UserRepo) {
        let cacheData;
        if (userType === UserType.VENDOR) {
            let storeDetails = data.storeDetails[0];
            storeDetails.storeLogo = storeDetails.storeLogo.length > 0 ? storeDetails.storeLogo[0].imageUrl : null;
            cacheData = { ...data };
            cacheData.storeDetails = JSON.stringify(storeDetails);
            if (data.oAuthDetails) {
                cacheData.oAuthDetails = JSON.stringify(data.oAuthDetails);
            }
            return { data, cacheData };
        } else if (userType === UserType.CUSTOMER) {
            let address = data.Address[0];
            data.Address = address;
            cacheData = { ...data };
            cacheData.Address = JSON.stringify(address);
            if (data.oAuthDetails) {
                cacheData.oAuthDetails = JSON.stringify(data.oAuthDetails);
            }
            return { data, cacheData };
        } else {
            return { data, cacheData: data }
        }

    }

    public responseData(dataType: ServiceResultDataType, statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return dataType == ServiceResultDataType.HTTP ? this.httpResponseData(statusCode, error, message, data) : this.socketResponseData(statusCode, error, message, data)
    }

    public httpResponseData(statusCode: number, error: boolean, message: string | null, data: any = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }

    public socketResponseData(statusCode: number, error: boolean, message: string | null = null, data: any = {}) {
        return {
            statusCode: statusCode,
            error: error,
            message: message,
            data: data
        };
    }

    public toSocketResponseData(serviceResult: HttpData) {
        return this.socketResponseData(serviceResult.statusCode, serviceResult.json.error, serviceResult.json.message, serviceResult.json.data)
    }

    protected httpHandleRepoError(repoResult: any) {
        if (repoResult.error) {
            return this.httpResponseData(repoResult.type, true, repoResult.message as string);
        }
        return null;
    }

    protected socketHandleRepoError(repoResult: any) {
        if (repoResult.error) {
            return this.socketResponseData(repoResult.type, true, repoResult.message as string);
        }
        return null;
    }

    protected handleRepoError(dataType: ServiceResultDataType, repoResult: any) {
        return dataType == ServiceResultDataType.HTTP ? this.httpHandleRepoError(repoResult) : this.socketHandleRepoError(repoResult);
    }

    protected async create<U>(createData: U, itemName: string) {
        const repoResult = await this.repo!.insert(createData);
        const error = repoResult.error;
        const statusCode = repoResult.type;
        const message = !error ? `${itemName} was created successfully` : repoResult.message!;
        return this.httpResponseData(statusCode, error, message, repoResult.data);
    }

    protected async getAllItems(message200: string) {
        const repoResult = await this.repo!.getAllWithFilter();

        if (repoResult.error) {
            return this.httpResponseData(repoResult.type, true, repoResult.message!);
        }

        return this.httpResponseData(200, false, message200, repoResult.data);
    }

    private async getItem(nameOrId: string | number, message200: string | undefined) {
        const repoResult = typeof nameOrId == "number" ? await this.repo!.getItemWithId(nameOrId) :
            await this.repo!.getItemWithName(nameOrId);
        const repoResultError = this.httpHandleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const data = repoResult.data;
        const statusCode = data ? 200 : 404;
        const error: boolean = !data;
        const message = error ? "Item was not found" : message200 ?? "Item was retrieved successfully";

        return this.httpResponseData(statusCode, error, message, data);
    }


    public async getItemWithId(id: number, message200?: string) {
        return await this.getItem(id, message200);
    }

    public async getItemWithName(name: string, message200?: string) {
        return await this.getItem(name, message200);
    }

    public async paginate(page: number, pageSize: number) {
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const repoResult = await this.repo!.paginate(Number(skip), take);

        if (repoResult.error) {
            return this.httpResponseData(repoResult.type, true, repoResult.message!);
        }
        const data: { items: any, totalItems: any } = repoResult.data as any;
        const totalRecords = data.totalItems;

        const pagination = getPagination(page, pageSize, totalRecords);

        return this.httpResponseData(200, false, `Items were retrieved successfully`, { // TODO: make this more specific
            data: data.items,
            pagination
        });
    }

    public sanitizeData(data: any[], fieldsToRemove: any[]): void {
        data.forEach(item => {
            fieldsToRemove.forEach(key => {
                delete item[key];
            });
        });
    }

    protected async deleteWithId(id: number) {
        const repoResult = await this.repo!.deleteWithId(id);
        if (repoResult.error) {
            return this.httpResponseData(repoResult.type, true, repoResult.message!);
        }

        return this.httpResponseData(200, false, "Item was deleted successfully");
    }

    public async totalRecords() {
        const repoResult = await this.repo!.countTblRecords();
        if (repoResult.error) {
            return this.httpResponseData(repoResult.type, true, repoResult.message!);
        }

        return this.httpResponseData(200, false, "Total records were counted successfully", { totalRecords: repoResult.data });
    }

    public getRepo() { return this.repo! }

}