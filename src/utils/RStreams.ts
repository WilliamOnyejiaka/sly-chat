import Redis from 'ioredis';
import { env } from '../config';
import { Server } from 'socket.io';

interface EventHandler {
    (event: any, stream: string, id: string, io: Server): Promise<void>;
}

interface StreamGroup {
    stream: string; // e.g., 'stream:profile'
    consumerGroup: string; // e.g., 'profile-consumers'
    handlers: Map<string, EventHandler>; // e.g., 'ProfileUpdated' -> handler
}

export class StreamRouter {
    private redis: Redis;
    private groups: Map<string, StreamGroup> = new Map();
    private consumerName: string;

    public constructor(consumerName: string) {
        this.redis = new Redis(env('redisURL')!, {
            maxRetriesPerRequest: 10,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });
        this.consumerName = consumerName; // Unique per instance (e.g., worker ID)

        this.redis.on('error', (err) => console.error('Redis error:', err));
    }

    // Group events under a stream (like a Blueprint)
    public group(groupName: string) {
        const stream = `stream:${groupName}`;
        const consumerGroup = `${groupName}-consumers`;
        const group: StreamGroup = { stream, consumerGroup, handlers: new Map() };
        this.groups.set(stream, group);
        return group;
    }

    // Register a handler for a specific event type in a group
    public on(group: StreamGroup, eventType: string, handler: EventHandler) {
        group.handlers.set(eventType, handler);
    }

    // Add an event to a stream with MAXLEN to cap size
    public async addEvent(groupName: string, event: any, maxLen: number = 1000) {
        const stream = `stream:${groupName}`;
        try {
            await this.redis.xadd(stream, 'MAXLEN', '~', maxLen, '*', 'data', JSON.stringify(event));
        } catch (err) {
            console.error(`Error adding event to ${stream}:`, err);
            throw err;
        }
    }

    // Initialize consumer groups and start consuming
    public async listen(io: Server) {
        for (const [stream, group] of this.groups) {
            // Create consumer group if it doesn't exist
            try {
                await this.redis.xgroup('CREATE', stream, group.consumerGroup, '0', 'MKSTREAM');
            } catch (err: any) {
                if (!err.message.includes('BUSYGROUP')) {
                    console.error(`Failed to create group for ${stream}:`, err);
                }
            }

            // Start reading events
            this.consumeStream(stream, group, io);
        }
    }

    private async consumeStream(stream: string, group: StreamGroup, io: Server) {
        while (true) {
            try {
                // Read events from the consumer group
                const results: any = await this.redis.xreadgroup(
                    'GROUP',
                    group.consumerGroup,
                    this.consumerName,
                    'COUNT',
                    10, // Batch size
                    'BLOCK',
                    2000, // Wait up to 2s
                    'STREAMS',
                    stream,
                    '>' // Get new events
                );

                if (results) {
                    for (const [streamName, entries] of results) {
                        for (const [id, fields] of entries) {
                            const event = JSON.parse(fields[1]);
                            const handler = group.handlers.get(event.type);
                            if (handler) {
                                try {
                                    await handler(event, streamName, id, io);
                                    // Acknowledge event
                                    await this.redis.xack(stream, group.consumerGroup, id);
                                    // Optionally delete event to free space (uncomment if needed)
                                    // await this.redis.xdel(stream, id);
                                } catch (err: any) {
                                    console.error(`Error handling event ${id} on ${stream}:`, err);
                                    // Move to dead-letter queue
                                    try {
                                        await this.redis.xadd(
                                            'stream:dead-letter',
                                            '*',
                                            'data',
                                            JSON.stringify({ event, error: err.message })
                                        );
                                    } catch (dlqErr) {
                                        console.error(`Error adding to dead-letter queue:`, dlqErr);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(`Error reading stream ${stream}:`, err);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Retry after delay
            }
        }
    }

    // Periodically trim streams to manage data retention
    async startStreamCleanup(intervalMs: number, maxLen: number) {
        setInterval(async () => {
            for (const [stream] of this.groups) {
                try {
                    await this.redis.xtrim(stream, 'MAXLEN', maxLen);
                    console.log(`Trimmed ${stream} to ${maxLen} entries`);
                } catch (err) {
                    console.error(`Error trimming ${stream}:`, err);
                }
            }
        }, intervalMs);
    }

    // Get stream memory usage for monitoring
    async getStreamMemoryInfo() {
        try {
            const memoryInfo = await this.redis.info('memory');
            return memoryInfo;
        } catch (err) {
            console.error('Error fetching memory info:', err);
            throw err;
        }
    }

    async disconnect() {
        await this.redis.quit();
    }
}