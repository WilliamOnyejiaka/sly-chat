import Redis from 'ioredis';
import { redisClient } from '../config';
import { Server } from 'socket.io';
import { StreamGroup, EventHandler } from '../types';
import { Streamer } from ".";

export default class StreamRouter {
    public redis: Redis;
    private groups: Map<string, StreamGroup> = new Map();

    public constructor() {
        this.redis = redisClient;
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

    public initializeStreamer(bluePrint: Streamer) {
        for (const event of bluePrint.events) {
            this.on(bluePrint.group, event.eventType, event.handler);
        }
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
    public async listen(consumerName: string, io?: Server) {
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
            this.consumeStream(stream, group, consumerName, io);
        }
    }

    private async consumeStream(stream: string, group: StreamGroup, consumerName: string, io?: Server) {
        while (true) {
            try {
                // Read events from the consumer group
                const results: any = await this.redis.xreadgroup(
                    'GROUP',
                    group.consumerGroup,
                    consumerName,
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

    public async reprocessDeadLetter(maxEvents: number = 100, deleteOnSuccess: boolean = true) {
        const dlqStream = 'stream:dead-letter';
        try {
            // Read up to maxEvents from the dead-letter queue
            const results = await this.redis.xrange(dlqStream, '-', '+', 'COUNT', maxEvents);
            const processedIds: string[] = [];

            for (const [id, fields] of results) {
                try {
                    const { event, error, originalStream } = JSON.parse(fields[1]);
                    const group = this.groups.get(originalStream);

                    if (!group) {
                        console.log(`No group found for original stream ${originalStream}, deleting event ${id}`);
                        processedIds.push(id); // Mark for deletion
                        continue;
                    }

                    const handler = group.handlers.get(event.type);
                    if (!handler) {
                        console.warn(`No handler found for event type ${event.type} in stream ${originalStream}, skipping event ${id}`);
                        processedIds.push(id); // Mark for deletion
                        continue;
                    }

                    // Attempt to reprocess the event
                    await handler(event, originalStream, id);
                    processedIds.push(id);
                    console.log(`Successfully reprocessed event ${id} from ${dlqStream}`);
                } catch (err: any) {
                    console.error(`Failed to reprocess event ${id} from ${dlqStream}:`, err);
                    // Optionally move to a permanent failure stream
                    try {
                        await this.redis.xadd(
                            'stream:permanent-failures',
                            '*',
                            'data',
                            JSON.stringify({
                                event: JSON.parse(fields[1]).event,
                                error: err.message,
                                originalStream: JSON.parse(fields[1]).originalStream,
                                originalError: JSON.parse(fields[1]).error
                            })
                        );
                    } catch (permErr) {
                        console.error(`Error moving event ${id} to permanent-failures:`, permErr);
                    }
                }
            }

            // Delete successfully processed or invalid (no group) events if requested
            if (deleteOnSuccess && processedIds.length > 0) {
                await this.redis.xdel(dlqStream, ...processedIds);
                console.log(`Deleted ${processedIds.length} processed or invalid events from ${dlqStream}`);
            }

            return { processed: processedIds.length, total: results.length };
        } catch (err) {
            console.error(`Error reprocessing dead-letter queue:`, err);
            throw err;
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