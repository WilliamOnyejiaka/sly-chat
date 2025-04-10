import { logger } from "../../config";
import { HttpStatus } from "../../constants";
import BaseService from "../../services/bases/BaseService";
import { ServiceData, HttpData } from "../../types";

export default class BaseFacade {

    public readonly service: BaseService = new BaseService();

    public constructor(protected invalidTypeMessage: string = "Invalid type") {
    }

    protected handleSocketFacadeResultError(servicesResult: ServiceData) {
        return servicesResult.error ? this.service.socketResponseData(servicesResult.statusCode, servicesResult.error, servicesResult.message) : null;
    }

    protected handleServiceError(serviceResult: HttpData) {
        if (serviceResult.json.error) {
            return serviceResult;
        }
        return null;
    }

    protected invalidType() {
        return this.service.httpResponseData(HttpStatus.INTERNAL_SERVER_ERROR, true, this.invalidTypeMessage);
    }

}