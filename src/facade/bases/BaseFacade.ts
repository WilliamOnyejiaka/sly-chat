import { HttpStatus } from "../../constants";
import BaseService from "../../services/bases/BaseService";

export default class BaseFacade {

    protected readonly service: BaseService = new BaseService();

    // public static readonly UserType = class {
    //     static readonly Admin = "admin";
    //     static readonly Vendor = "vendor";
    //     static readonly Customer = "customer";
    // }

    public constructor(protected invalidTypeMessage: string = "Invalid type" ) {
        
    }


    protected handleServiceError(serviceResult: any) {
        if (serviceResult.json.error) {
            return serviceResult;
        }
        return null;
    }

    protected invalidType(){
        return this.service.responseData(HttpStatus.INTERNAL_SERVER_ERROR,true,this.invalidTypeMessage);
    }

}