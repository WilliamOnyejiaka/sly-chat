"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../../types/enums");
const utils_1 = require("../../utils");
class BaseService {
    constructor(repo) {
        this.repo = repo;
    }
    responseData(dataType, statusCode, error, message, data = {}) {
        return dataType == enums_1.ServiceResultDataType.HTTP ? this.httpResponseData(statusCode, error, message, data) : this.socketResponseData(statusCode, error, message, data);
    }
    httpResponseData(statusCode, error, message, data = {}) {
        return {
            statusCode: statusCode,
            json: {
                error: error,
                message: message,
                data: data
            }
        };
    }
    socketResponseData(statusCode, error, message = null, data = {}) {
        return {
            statusCode: statusCode,
            error: error,
            message: message,
            data: data
        };
    }
    toSocketResponseData(serviceResult) {
        return this.socketResponseData(serviceResult.statusCode, serviceResult.json.error, serviceResult.json.message, serviceResult.json.data);
    }
    httpHandleRepoError(repoResult) {
        if (repoResult.error) {
            return this.httpResponseData(repoResult.type, true, repoResult.message);
        }
        return null;
    }
    socketHandleRepoError(repoResult) {
        if (repoResult.error) {
            return this.socketResponseData(repoResult.type, true, repoResult.message);
        }
        return null;
    }
    handleRepoError(dataType, repoResult) {
        return dataType == enums_1.ServiceResultDataType.HTTP ? this.httpHandleRepoError(repoResult) : this.socketHandleRepoError(repoResult);
    }
    create(createData, itemName) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.insert(createData);
            const error = repoResult.error;
            const statusCode = repoResult.type;
            const message = !error ? `${itemName} was created successfully` : repoResult.message;
            return this.httpResponseData(statusCode, error, message, repoResult.data);
        });
    }
    getAllItems(message200) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.getAllWithFilter();
            if (repoResult.error) {
                return this.httpResponseData(repoResult.type, true, repoResult.message);
            }
            return this.httpResponseData(200, false, message200, repoResult.data);
        });
    }
    getItem(nameOrId, message200) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = typeof nameOrId == "number" ? yield this.repo.getItemWithId(nameOrId) :
                yield this.repo.getItemWithName(nameOrId);
            if (repoResult.error) {
                return this.httpResponseData(repoResult.type, true, repoResult.message);
            }
            const data = repoResult.data;
            const statusCode = data ? 200 : 404;
            const error = !data;
            const message = error ? "Item was not found" : message200 !== null && message200 !== void 0 ? message200 : "Item was retrieved successfully";
            return this.httpResponseData(statusCode, error, message, data);
        });
    }
    getItemWithId(id, message200) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getItem(id, message200);
        });
    }
    getItemWithName(name, message200) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getItem(name, message200);
        });
    }
    paginate(page, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const take = pageSize;
            const repoResult = yield this.repo.paginate(Number(skip), take);
            if (repoResult.error) {
                return this.httpResponseData(repoResult.type, true, repoResult.message);
            }
            const totalRecords = repoResult.data.totalItems;
            const pagination = (0, utils_1.getPagination)(page, pageSize, totalRecords);
            return this.httpResponseData(200, false, `Items were retrieved successfully`, {
                data: repoResult.data.items,
                pagination
            });
        });
    }
    sanitizeData(data, fieldsToRemove) {
        data.forEach(item => {
            fieldsToRemove.forEach(key => {
                delete item[key];
            });
        });
    }
    deleteWithId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.deleteWithId(id);
            if (repoResult.error) {
                return this.httpResponseData(repoResult.type, true, repoResult.message);
            }
            return this.httpResponseData(200, false, "Item was deleted successfully");
        });
    }
    totalRecords() {
        return __awaiter(this, void 0, void 0, function* () {
            const repoResult = yield this.repo.countTblRecords();
            if (repoResult.error) {
                return this.httpResponseData(repoResult.type, true, repoResult.message);
            }
            return this.httpResponseData(200, false, "Total records were counted successfully", { totalRecords: repoResult.data });
        });
    }
    getRepo() { return this.repo; }
}
exports.default = BaseService;
