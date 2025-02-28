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
const Repo_1 = __importDefault(require("./Repo"));
class UserRepo extends Repo_1.default {
    constructor(tblName, imageRelation) {
        super(tblName);
        this.imageRelation = imageRelation;
    }
    getUserWithId(userId) {
        const _super = Object.create(null, {
            getItemWithId: { get: () => super.getItemWithId }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.getItemWithId.call(this, userId);
        });
    }
    getUserWithPhoneNumber(phoneNumber) {
        const _super = Object.create(null, {
            getItem: { get: () => super.getItem }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.getItem.call(this, { 'phoneNumber': phoneNumber });
        });
    }
    getUserProfile(userIdOrEmail) {
        const _super = Object.create(null, {
            getItem: { get: () => super.getItem }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const where = typeof userIdOrEmail == "number" ? { id: userIdOrEmail } : { email: userIdOrEmail };
            return yield _super.getItem.call(this, where, {
                include: {
                    [this.imageRelation]: {
                        select: {
                            imageUrl: true
                        },
                    }
                }
            });
        });
    }
    getUserProfileWithId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUserProfile(userId);
        });
    }
    getUserProfileWithEmail(userEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getUserProfile(userEmail);
        });
    }
    getAllWithFilter(filter) {
        const _super = Object.create(null, {
            getAllWithFilter: { get: () => super.getAllWithFilter }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.getAllWithFilter.call(this, {
                include: {
                    [this.imageRelation]: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            });
        });
    }
    updateWithIdOrEmail(idOrEmail, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = typeof idOrEmail == "number" ? { id: idOrEmail } : { email: idOrEmail };
            return yield this.update(where, data);
        });
    }
    updateActiveStatus(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, activate = true) {
            return yield this.updateWithIdOrEmail(userId, { active: activate });
        });
    }
    updateVerifiedStatus(email) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super.update.call(this, { email: email }, { verified: true });
        });
    }
    paginate(skip, take) {
        const _super = Object.create(null, {
            paginate: { get: () => super.paginate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.paginate.call(this, skip, take, {
                include: {
                    [this.imageRelation]: {
                        select: {
                            imageUrl: true
                        }
                    }
                }
            });
        });
    }
}
exports.default = UserRepo;
