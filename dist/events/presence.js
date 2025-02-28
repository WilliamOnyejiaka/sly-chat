"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const namespaces_1 = require("../namespaces");
const handlers_1 = require("../handlers");
const presence = new namespaces_1.Presence();
presence.onConnection(handlers_1.PresenceHandler.onConnection.bind(handlers_1.PresenceHandler));
presence.register("disconnect", handlers_1.PresenceHandler.disconnect.bind(handlers_1.PresenceHandler));
exports.default = presence;
