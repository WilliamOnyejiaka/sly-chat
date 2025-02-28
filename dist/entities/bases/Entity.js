"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseEntity {
    constructor(excludedFields) {
        this.excludedFields = excludedFields;
    }
    toPlainObject() {
        return Object.assign({}, this);
    }
    toSecureObject() {
        const plainObject = this.toPlainObject();
        // Exclude fields listed in `excludedFields`
        this.excludedFields.forEach((field) => {
            delete plainObject[field];
        });
        return plainObject;
    }
}
exports.default = BaseEntity;
