import { Presence } from "../namespaces";
import { PresenceHandler } from "../handlers";
import { ISocket } from "../types";

const presence = new Presence();

presence.register("userIsOnline", PresenceHandler.userIsOnline.bind(PresenceHandler));
presence.register("disconnect", PresenceHandler.disconnect.bind(PresenceHandler));

export default presence;