import constants from "../constants";
import VendorDto from "../types/dtos";
import { redisClient } from "./../config";
import BaseCache from "./BaseCache";

export default class TokenBlackList extends BaseCache {

    public constructor() {
        super('blacklist');
    }
}