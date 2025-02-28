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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const __1 = __importDefault(require(".."));
const constants_1 = require("../../constants");
const config_1 = require("../../config");
class Repo {
    constructor(tblName) {
        this.tblName = tblName;
    }
    insert(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newItem = yield __1.default[this.tblName].create({ data: data });
                return this.repoResponse(false, 201, null, newItem);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    insertMany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newItems = yield __1.default[this.tblName].createMany({ data: data, skipDuplicates: true });
                return this.repoResponse(false, 201, null, newItems);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    checkIfTblHasData() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.countTblRecords();
            return result.error ? result : this.repoResponse(false, 200, null, result.data > 0);
        });
    }
    getItemWithId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getItem({ id: id });
        });
    }
    getItemWithName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getItem({ name: name });
        });
    }
    getItemWithRelation(where, include) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield __1.default[this.tblName].findUnique({
                    where: where,
                    include: include
                });
                return this.repoResponse(false, 200, null, item);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    getItem(where_1) {
        return __awaiter(this, arguments, void 0, function* (where, others = {}) {
            try {
                const item = yield __1.default[this.tblName].findFirst(Object.assign({ where: where }, others));
                return this.repoResponse(false, 200, null, item);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    delete(where) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedData = yield __1.default[this.tblName].delete({
                    where: where,
                });
                return this.repoResponse(false, 200, null, deletedData);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    // public async undoDelete(where: any) { // TODO: handle this later
    //     try {
    //         const restoredData = await (prisma[this.tblName] as any).update({
    //             where: where,
    //             data: { deleted: false },
    //         });
    //         return this.repoResponse(false, 200, null, restoredData);
    //     } catch (error: any) {
    //         return this.handleDatabaseError(error);
    //     }
    // }
    deleteWithId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.delete({ id: id });
        });
    }
    update(where, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedItem = yield __1.default[this.tblName].update({
                    where: where,
                    data: data
                });
                return this.repoResponse(false, 200, null, updatedItem);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    countTblRecords() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield __1.default[this.tblName].count();
                return this.repoResponse(false, 200, null, count);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    paginate(skip_1, take_1) {
        return __awaiter(this, arguments, void 0, function* (skip, take, filter = {}) {
            try {
                const items = yield __1.default[this.tblName].findMany(Object.assign({ skip, // Skips the first 'skip' records
                    take }, filter));
                const totalItems = yield __1.default[this.tblName].count();
                return this.repoResponse(false, 200, null, {
                    items: items,
                    totalItems: totalItems
                });
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    getAll(where) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield __1.default[this.tblName].findMany({
                    where: where
                });
                return this.repoResponse(false, 200, null, items);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    getAllWithFilter() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            try {
                const items = yield __1.default[this.tblName].findMany(filter);
                return this.repoResponse(false, 200, null, items);
            }
            catch (error) {
                return this.handleDatabaseError(error);
            }
        });
    }
    repoResponse(error, type, message = null, data = {}) {
        return {
            error: error,
            message: message,
            type: type,
            data: data
        };
    }
    handleDatabaseError(error) {
        console.log(error);
        if (error.code === "P2002") {
            // Unique constraint violation
            config_1.logger.error(`Unique constraint violation error for the ${this.tblName} table`);
            return {
                error: true,
                message: "A record with this data already exists.",
                type: 400,
                data: {}
            };
        }
        else if (error.code === "P2025") {
            config_1.logger.error(`Item was not found for the ${this.tblName} table`);
            return {
                error: true,
                message: "Item was not found.",
                type: 404,
                data: {}
            };
        }
        else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            // Handle known Prisma errors
            switch (error.code) {
                case "P2003":
                    // Foreign key constraint violation
                    config_1.logger.error(`Foreign key constraint violation error for the ${this.tblName} table`);
                    return {
                        error: true,
                        message: `Invalid foreign key reference. Please check related fields.`,
                        type: 400,
                        data: {}
                    };
                case "P2001":
                    // Record not found
                    config_1.logger.error(`Record not found for the ${this.tblName} table`);
                    return {
                        error: true,
                        message: "The requested record could not be found.",
                        type: 400,
                        data: {}
                    };
                case "P2000":
                    // Value too long for a column
                    config_1.logger.error(`Value too long for a column for the ${this.tblName} table`);
                    return {
                        error: true,
                        message: "A value provided is too long for one of the fields.",
                        type: 400,
                        data: {}
                    };
                default:
                    config_1.logger.error(`An unexpected database error occurred for the ${this.tblName} table`, error.message);
                    return {
                        error: true,
                        message: "An unexpected database error occurred.",
                        type: 400,
                        data: {}
                    };
                    ;
            }
        }
        else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
            config_1.logger.error(`Validation error in the ${this.tblName} table`);
            return {
                error: true,
                message: 'Invalid data provided. Please check that all fields are correctly formatted.',
                type: 400,
                data: {}
            };
        }
        // Fallback for unexpected errors
        config_1.logger.error(error);
        return {
            error: true,
            message: (0, constants_1.http)("500"),
            type: 500,
            data: {}
        };
    }
}
exports.default = Repo;
