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
const cache_1 = require("../cache");
const constants_1 = require("../constants");
const vendorIsActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = res.locals.data.id;
    const cache = new cache_1.VendorCache();
    const cacheResult = yield cache.get(String(id));
    if (cacheResult.error) {
        res.status(500).json({
            error: true,
            message: (0, constants_1.http)('500'),
            data: null
        });
        return;
    }
    if (!cacheResult.data.active) {
        res.status(400).json({
            error: true,
            message: "Vendor account has been deactivated please contact an administrator",
            data: null
        });
        return;
    }
    next();
});
exports.default = vendorIsActive;
