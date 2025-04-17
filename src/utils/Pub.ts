import Redis from 'ioredis';
import { Server } from 'socket.io';
import { env } from '../config';

interface EventHandler {
    (event: any, channel: string, io: Server): Promise<void>;
}

interface EventGroup {
    pattern: string; // e.g., 'events:profile:*'
    handlers: Map<string, EventHandler>; // e.g., 'events:profile:updated' -> handler
}

export class PubSubRouter {
    private subscriber: Redis;
    private groups: Map<string, EventGroup> = new Map();

    constructor() {
        this.subscriber = new Redis(env('redisURL')!);
        // Handle Redis errors
        this.subscriber.on('error', (err) => console.error('Redis subscriber error:', err));
    }

    // Group events under a pattern (like a Blueprint)
    group(groupName: string) {
        const pattern = `events:${groupName}:*`;
        const group: EventGroup = { pattern, handlers: new Map() };
        this.groups.set(pattern, group);
        // callback(group);
        return group;
    }

    // Register a handler for a specific event in a group
    on(group: EventGroup, eventType: string, handler: EventHandler) {
        const channel = `events:${group.pattern.split(':*')[0].replace('events:', '')}:${eventType}`;
        group.handlers.set(channel, handler);
    }

    // Start subscribing to all groups
    async listen(io: Server) {
        for (const [pattern, group] of this.groups) {
            await this.subscriber.psubscribe(pattern, (err, count) => {
                if (err) {
                    console.error(`Failed to subscribe to ${pattern}:`, err);
                } else {
                    console.log(`Subscribed to ${pattern} (${count} patterns)`);
                }
            });
        }

        // Route events to handlers
        this.subscriber.on('pmessage', async (pattern, channel, message) => {
            const group = this.groups.get(pattern);
            if (group) {
                const handler = group.handlers.get(channel);
                if (handler) {
                    try {
                        const event = JSON.parse(message);
                        await handler(event, channel, io);
                    } catch (err) {
                        console.error(`Error handling event on ${channel}:`, err);
                    }
                }
            }
        });
    }

    // Clean up
    async disconnect() {
        await this.subscriber.quit();
    }
}