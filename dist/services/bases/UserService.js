"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../config");
const constants_1 = __importStar(require("../../constants"));
const utils_1 = require("../../utils");
const Image_1 = __importDefault(require("../Image"));
const BaseService_1 = __importDefault(require("./BaseService"));
class UserService extends BaseService_1.default {
    constructor(repo, cache, profilePicRepo) {
        super(repo);
        this.profilePicRepo = profilePicRepo;
        this.imageService = new Image_1.default();
        this.storedSalt = (0, config_1.env)("storedSalt");
        this.cache = cache;
    }
    createUser(userData) {
        const _super = Object.create(null, {
            httpHandleRepoError: { get: () => super.httpHandleRepoError },
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.insert(userData);
            const repoResultError = _super.httpHandleRepoError.call(this, repoResult);
            if (repoResultError)
                return repoResultError;
            return _super.httpResponseData.call(this, 201, false, "User has been created successfully", repoResult.data);
        });
    }
    sanitizeUserImageItems(items) {
        items.forEach((item) => {
            item.profilePictureUrl = item[this.repo.imageRelation].length != 0 ? item[this.repo.imageRelation][0].imageUrl : null;
            delete item[this.repo.imageRelation];
            delete item.password;
        });
    }
    emailExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailExists = yield this.repo.getUserProfileWithEmail(email);
            const errorResponse = this.httpHandleRepoError(emailExists);
            if (errorResponse)
                return errorResponse;
            const statusCode = emailExists.data ? constants_1.HttpStatus.BAD_REQUEST : constants_1.HttpStatus.OK;
            const error = !!emailExists.data;
            return this.httpResponseData(statusCode, error, error ? (0, constants_1.default)("service400Email") : null);
        });
    }
    getUserProfileWithId(userId) {
        const _super = Object.create(null, {
            httpHandleRepoError: { get: () => super.httpHandleRepoError },
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.getUserProfileWithId(userId);
            const errorResponse = _super.httpHandleRepoError.call(this, repoResult);
            if (errorResponse)
                return errorResponse;
            const statusCode = repoResult.data ? constants_1.HttpStatus.OK : constants_1.HttpStatus.NOT_FOUND;
            const error = repoResult.error;
            const user = repoResult.data;
            if (user) {
                this.sanitizeUserImageItems([user]);
                return _super.httpResponseData.call(this, statusCode, error, (0, constants_1.default)('200User'), user);
            }
            return _super.httpResponseData.call(this, statusCode, error, (0, constants_1.default)('404User'), repoResult.data);
        });
    }
    getUserProfileWithEmail(email) {
        const _super = Object.create(null, {
            httpHandleRepoError: { get: () => super.httpHandleRepoError },
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.getUserProfileWithEmail(email);
            const errorResponse = _super.httpHandleRepoError.call(this, repoResult);
            if (errorResponse)
                return errorResponse;
            const statusCode = repoResult.data ? constants_1.HttpStatus.OK : constants_1.HttpStatus.NOT_FOUND;
            const error = repoResult.error;
            const user = repoResult.data;
            if (user) {
                this.sanitizeUserImageItems([user]);
                return _super.httpResponseData.call(this, statusCode, error, (0, constants_1.default)('200User'), user);
            }
            return _super.httpResponseData.call(this, statusCode, error, (0, constants_1.default)('404User'), user);
        });
    }
    getAllUsers() {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.getAllWithFilter();
            const errorResponse = this.httpHandleRepoError(repoResult);
            if (errorResponse)
                return errorResponse;
            this.sanitizeUserImageItems(repoResult.data);
            return _super.httpResponseData.call(this, constants_1.HttpStatus.OK, false, (0, constants_1.default)('200Users'), repoResult.data);
        });
    }
    paginateUsers(page, pageSize) {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize; // Calculate the offset
            const take = pageSize; // Limit the number of records
            const repoResult = yield this.repo.paginate(skip, take);
            const errorResponse = this.httpHandleRepoError(repoResult);
            if (errorResponse)
                return errorResponse;
            const totalRecords = repoResult.data.totalItems;
            const pagination = (0, utils_1.getPagination)(page, pageSize, totalRecords);
            this.sanitizeUserImageItems(repoResult.data.items);
            return _super.httpResponseData.call(this, constants_1.HttpStatus.OK, false, (0, constants_1.default)('200Users'), {
                data: repoResult.data,
                pagination
            });
        });
    }
    toggleActiveStatus(userId_1) {
        const _super = Object.create(null, {
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, arguments, void 0, function* (userId, activate = true) {
            const repoResult = activate ? yield this.repo.updateActiveStatus(userId, true) : yield this.repo.updateActiveStatus(userId, false);
            const errorResponse = this.httpHandleRepoError(repoResult);
            if (errorResponse)
                return errorResponse;
            //Cache here
            const message = activate ? "Vendor was activated successfully" : "Vendor was deactivated successfully";
            return _super.httpResponseData.call(this, 200, false, message, repoResult.data);
        });
    }
    activateUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.toggleActiveStatus(userId);
        });
    }
    deActivateUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.toggleActiveStatus(userId, false);
        });
    }
    deleteUser(userId) {
        const _super = Object.create(null, {
            httpHandleRepoError: { get: () => super.httpHandleRepoError },
            httpResponseData: { get: () => super.httpResponseData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const profileRepoResult = yield this.repo.getUserProfileWithId(userId);
            const profileRepoResultError = _super.httpHandleRepoError.call(this, profileRepoResult);
            if (profileRepoResultError)
                return profileRepoResultError;
            const userProfile = profileRepoResult.data;
            if (!userProfile)
                return _super.httpResponseData.call(this, 404, true, "User was not found");
            const profilePictureDetails = userProfile[this.repo.imageRelation].length > 0 ? userProfile[this.repo.imageRelation][0] : null;
            if (profilePictureDetails) {
                const cloudinaryResult = yield this.imageService.deleteCloudinaryImage(profilePictureDetails.publicId);
                if (cloudinaryResult.statusCode >= 500) {
                    return cloudinaryResult;
                }
            }
            const repoResult = yield this.repo.deleteWithId(userId);
            const repoResultError = _super.httpHandleRepoError.call(this, repoResult);
            if (repoResultError)
                return repoResultError;
            const deleted = yield this.cache.delete(String(userId));
            return deleted ?
                _super.httpResponseData.call(this, 200, false, "User was deleted successfully") :
                _super.httpResponseData.call(this, 500, true, (0, constants_1.http)('500'));
        });
    }
}
exports.default = UserService;
