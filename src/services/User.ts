import BaseService from "./bases/BaseService";
import { User as UserRepo } from "../repos";
import { UserDto } from "../types/dtos";

export default class User extends BaseService<UserRepo> {

    public constructor(){
        super(new UserRepo());
    }

    public async createUser(newUser: UserDto){
        newUser.userType = newUser.userType?.toUpperCase();
        const repoResult = await this.repo!.insert(newUser);
        const repoResultError = super.httpHandleRepoError(repoResult);
        if(repoResultError) return repoResultError;
        return super.httpResponseData(201,false,"User has been created successfully",repoResult.data);
    }

    
}