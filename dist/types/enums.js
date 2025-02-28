"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceResultDataType = exports.Namespace = exports.Events = exports.UserType = void 0;
var UserType;
(function (UserType) {
    UserType["Admin"] = "admin";
    UserType["Vendor"] = "vendor";
    UserType["Customer"] = "customer";
})(UserType || (exports.UserType = UserType = {}));
;
var Events;
(function (Events) {
    Events["APP_ERROR"] = "appError";
})(Events || (exports.Events = Events = {}));
var Namespace;
(function (Namespace) {
    Namespace["CHAT"] = "/chat";
    Namespace["PRESENCE"] = "/presence";
    Namespace["NOTIFICATION"] = "/notification";
})(Namespace || (exports.Namespace = Namespace = {}));
var ServiceResultDataType;
(function (ServiceResultDataType) {
    ServiceResultDataType["HTTP"] = "http";
    ServiceResultDataType["SOCKET"] = "socket";
})(ServiceResultDataType || (exports.ServiceResultDataType = ServiceResultDataType = {}));
