import constants, { http, HttpStatus, urls } from "../constants";
import { VendorProfilePicture, Vendor as VendorRepo } from "../repos";
import { VendorCache } from "../cache";
import UserService from "./bases/UserService";
import { Password } from "../utils";
import VendorDto from "../types/dtos";

export default class Vendor extends UserService<VendorRepo, VendorCache, VendorProfilePicture> {

    public constructor() {
        super(new VendorRepo(), new VendorCache(), new VendorProfilePicture());
    }
}