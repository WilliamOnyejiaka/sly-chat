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
const __1 = __importDefault(require(".."));
const Repo_1 = __importDefault(require("./Repo"));
class ImageRepo extends Repo_1.default {
    constructor(tblName, parentIdName) {
        super(tblName);
        this.parentIdName = parentIdName;
    }
    insertImage(data) {
        const _super = Object.create(null, {
            repoResponse: { get: () => super.repoResponse },
            handleDatabaseError: { get: () => super.handleDatabaseError }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const parentColumn = { [this.parentIdName]: data.parentId };
            delete data.parentId;
            try {
                const newImage = yield __1.default[this.tblName].create({
                    data: Object.assign(Object.assign({}, data), parentColumn),
                });
                return _super.repoResponse.call(this, false, 201, null, newImage);
            }
            catch (error) {
                return _super.handleDatabaseError.call(this, error);
            }
        });
    }
    getImage(id) {
        const _super = Object.create(null, {
            repoResponse: { get: () => super.repoResponse },
            handleDatabaseError: { get: () => super.handleDatabaseError }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const image = yield __1.default[this.tblName].findUnique({
                    where: {
                        [this.parentIdName]: id
                    }
                });
                return _super.repoResponse.call(this, false, 200, null, image);
            }
            catch (error) {
                return _super.handleDatabaseError.call(this, error);
            }
        });
    }
    getImages(id) {
        const _super = Object.create(null, {
            repoResponse: { get: () => super.repoResponse },
            handleDatabaseError: { get: () => super.handleDatabaseError }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const image = yield __1.default[this.tblName].findMany({
                    where: {
                        [this.parentIdName]: id
                    }
                });
                return _super.repoResponse.call(this, false, 200, null, image);
            }
            catch (error) {
                return _super.handleDatabaseError.call(this, error);
            }
        });
    }
}
exports.default = ImageRepo;
