"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = parseJson;
const config_1 = require("../config");
function parseJson(jsonData) {
    try {
        const decodedJson = JSON.parse(jsonData);
        return {
            error: false,
            message: null,
            data: decodedJson
        };
    }
    catch (error) {
        config_1.logger.error(error.message);
        return {
            error: true,
            message: error.message,
            data: null
        };
    }
}
