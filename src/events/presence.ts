import { Presence } from "../namespaces";
import { PresenceHandler } from "../handlers/sockets";

const presence = new Presence();

presence.onConnection(PresenceHandler.onConnection.bind(PresenceHandler));
presence.register("disconnect", PresenceHandler.disconnect.bind(PresenceHandler));

export default presence;