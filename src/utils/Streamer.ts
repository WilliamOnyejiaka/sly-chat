import { StreamGroup, EventHandler } from "../types";

export default class Streamer {

    public events: { eventType: string, handler: EventHandler }[] = [];
    public group: StreamGroup;

    public constructor(group: StreamGroup) {
        this.group = group;
    }

    public on(eventType: string, handler: EventHandler) {
        this.events.push({ eventType, handler });
    }
}