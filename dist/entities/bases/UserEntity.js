"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const validators_1 = require("../../validators");
const Entity_1 = __importDefault(require("./Entity"));
class UserEntity extends Entity_1.default {
    constructor(id, firstName, password, lastName, email) {
        super(['password']);
        this.id = id;
        this.firstName = firstName;
        this.password = password;
        this.lastName = lastName;
        this.email = email;
    }
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    validateEmail() {
        return (0, validators_1.emailValidator)(this.email);
    }
    comparePassword(plainPassword, storedSalt) {
        return utils_1.Password.compare(plainPassword, this.password, storedSalt);
    }
}
exports.default = UserEntity;
