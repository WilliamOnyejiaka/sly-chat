import Redis from 'ioredis';
import { logger, redisClient } from '../config';
import { Server } from 'socket.io';
import { StreamGroup, EventHandler } from '../types';
import { Streamer } from ".";
import { Gauge } from 'prom-client';

export default class StreamRouter {
    public redis: Redis;
    private groups: Map<string, StreamGroup> = new Map();
    private config = {
        batchSize: 50, // Configurable batch size for xreadgroup
        maxLen: 100, // Default stream length cap
        dlqMaxLen: 500, // DLQ size cap
        // cleanupIntervalMs: 300000, // 5 minutes
        retryMaxAttempts: 2, // Retry failed events twice
        retryBaseDelayMs: 1000, // Initial retry delay
        retryMaxDelayMs: 60000, // Max retry delay (1 minute)
        deleteAfterAck: true, // Delete events after ACK to save memory
    };
    private metrics = {
        streamLength: new Gauge({
            name: 'stream_length',
            help: 'Current length of each stream',
            labelNames: ['stream'],
        }),
        dlqLength: new Gauge({
            name: 'dlq_length',
            help: 'Current length of dead-letter queue',
        }),
        processingErrors: new Gauge({
            name: 'processing_errors_total',
            help: 'Total event processing errors',
            labelNames: ['stream'],
        }),
    };

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

    // Add an event to a stream with aggressive trimming
    public async addEvent(groupName: string, event: any, maxLen: number = this.config.maxLen) {
        const stream = `stream:${groupName}`;
        try {
            await this.redis.pipeline()
                .xadd(stream, 'MAXLEN', '~', maxLen, '*', 'data', JSON.stringify(event))
                .xtrim(stream, 'MAXLEN', '~', maxLen)
                .exec();
            this.metrics.streamLength.set({ stream }, await this.redis.xlen(stream));
        } catch (err) {
            console.error(`Error adding event to ${stream}:`, err);
            throw err;
        }
    }

    // Initialize consumer groups and start consuming
    public async listen(consumerName: string, io?: Server) {
        logger.info('Chat API StreamRouter is listening...');
        for (const [stream, group] of this.groups) {
            try {
                await this.redis.xgroup('CREATE', stream, group.consumerGroup, '0', 'MKSTREAM');
            } catch (err: any) {
                if (!err.message.includes('BUSYGROUP')) {
                    console.error(`Failed to create group for ${stream}:`, err);
                }
            }
            this.consumeStream(stream, group, consumerName, io);
        }
    }

    private async consumeStream(stream: string, group: StreamGroup, consumerName: string, io?: Server) {
        const retryCounts = new Map<string, number>();

        const concurrency = 1;
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        while (true) {
            try {
                const streamLen = await this.redis.xlen(stream);
                this.metrics.streamLength.set({ stream }, streamLen);
                if (streamLen === 0) {
                    await delay(3000);
                    continue;
                }

                const results: any = await this.redis.xreadgroup(
                    'GROUP', group.consumerGroup, consumerName,
                    'COUNT', this.config.batchSize,
                    'BLOCK', 2000,
                    'STREAMS', stream, '>'
                );

                if (!results) continue;

                const [streamName, entries] = results[0];

                const chunks = Array.from({ length: Math.ceil(entries.length / concurrency) }, (_, i) =>
                    entries.slice(i * concurrency, (i + 1) * concurrency)
                );

                for (const chunk of chunks) {
                    await Promise.allSettled(chunk.map(async ([id, fields]: any) => {
                        const data = JSON.parse(fields[1]);
                        const eventType = data.type;
                        const handler = group.handlers.get(eventType)
                            || Array.from(group.handlers.entries()).find(([key]) => new RegExp(key).test(eventType))?.[1];

                        if (!handler) return;

                        try {
                            await handler(data, streamName, id, io);
                            const pipe = this.redis.pipeline().xack(stream, group.consumerGroup, id);
                            if (this.config.deleteAfterAck) pipe.xdel(stream, id);
                            await pipe.exec();
                            retryCounts.delete(id);
                        } catch (err: any) {
                            const retries = (retryCounts.get(id) || 0) + 1;
                            retryCounts.set(id, retries);
                            this.metrics.processingErrors.inc({ stream });

                            if (retries >= this.config.retryMaxAttempts) {
                                await this.redis.xadd(
                                    'stream:dead-letter',
                                    'MAXLEN', '~', this.config.dlqMaxLen,
                                    '*', 'data',
                                    JSON.stringify({ event: data, error: err.message, originalStream: stream })
                                );
                                retryCounts.delete(id);
                            } else {
                                const backoff = Math.min(this.config.retryBaseDelayMs * 2 ** retries, this.config.retryMaxDelayMs);
                                await delay(backoff);
                            }
                        }
                    }));
                }
            } catch (err) {
                console.error(`Stream ${stream} read error:`, err);
                await delay(2000);
            }
        }
    }

    public async reprocessDeadLetter(maxEvents: number = 100, deleteOnSuccess: boolean = true) {
        const dlqStream = 'stream:dead-letter';
        try {
            const results = await this.redis.xrange(dlqStream, '-', '+', 'COUNT', maxEvents);
            const processedIds: string[] = [];
            const pipeline = this.redis.pipeline();

            for (const [id, fields] of results) {
                try {
                    const { event, error, originalStream } = JSON.parse(fields[1]);
                    const group = this.groups.get(originalStream);
                    if (!group) {
                        logger.info(`No group found for stream ${originalStream}, deleting event ${id}`);
                        processedIds.push(id);
                        continue;
                    }
                    const handler = group.handlers.get(event.type);
                    if (!handler) {
                        logger.warn(`No handler for event type ${event.type}, skipping ${id}`);
                        processedIds.push(id);
                        continue;
                    }
                    await handler(event, originalStream, id);
                    processedIds.push(id);
                } catch (err: any) {
                    logger.error(`Failed to reprocess event ${id}:`, err);
                    pipeline.xadd(
                        'stream:permanent-failures',
                        'MAXLEN', '~', this.config.dlqMaxLen,
                        '*',
                        'data',
                        JSON.stringify({
                            event: JSON.parse(fields[1]).event,
                            error: err.message,
                            originalStream: JSON.parse(fields[1]).originalStream,
                            originalError: JSON.parse(fields[1]).error
                        })
                    );
                }
            }

            if (deleteOnSuccess && processedIds.length > 0) {
                pipeline.xdel(dlqStream, ...processedIds);
            }
            pipeline.xtrim(dlqStream, 'MAXLEN', '~', this.config.dlqMaxLen);
            await pipeline.exec();
            this.metrics.dlqLength.set(await this.redis.xlen(dlqStream));
            return { processed: processedIds.length, total: results.length };
        } catch (err) {
            console.error(`Error reprocessing dead-letter queue:`, err);
            throw err;
        }
    }

    public async startDlqReprocessing() {
        const dlqStream = 'stream:dead-letter';
        try {
            const dlqLen = await this.redis.xlen(dlqStream);
            this.metrics.dlqLength.set(dlqLen);
            if (dlqLen > 0) {
                const result = await this.reprocessDeadLetter(100, true);
                console.log(`Reprocessed ${result.processed} of ${result.total} DLQ events`);
            }
        } catch (err) {
            console.error('Error in DLQ reprocessing cron:', err);
        }
    }

    public async startDlqCleanup() {
        try {
            await this.redis.xtrim('stream:dead-letter', 'MAXLEN', '~', this.config.dlqMaxLen);
            await this.redis.xtrim('stream:permanent-failures', 'MAXLEN', '~', this.config.dlqMaxLen);
            this.metrics.dlqLength.set(await this.redis.xlen('stream:dead-letter'));
            console.log('Trimmed DLQ and permanent failures');
        } catch (err) {
            logger.error('Error during DLQ cleanup:', err);
        }
    }

    async getStreamMemoryInfo() {
        try {
            const streamInfo: Record<string, number> = {};
            for (const [stream] of this.groups) {
                streamInfo[stream] = await this.redis.xlen(stream);
                this.metrics.streamLength.set({ stream }, streamInfo[stream]);
            }
            streamInfo['dead-letter'] = await this.redis.xlen('stream:dead-letter');
            streamInfo['permanent-failures'] = await this.redis.xlen('stream:permanent-failures');
            this.metrics.dlqLength.set(streamInfo['dead-letter']);
            return streamInfo;
        } catch (err) {
            console.error('Error fetching stream info:', err);
            throw err;
        }
    }

    async disconnect() {
        await this.redis.quit();
    }
}