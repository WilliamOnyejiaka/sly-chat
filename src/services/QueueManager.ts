import { Queue, Worker, QueueOptions, WorkerOptions } from 'bullmq';
import { Server } from 'socket.io';
import { QueueWorkerPair } from './QueueWorkerPair';
import { JobProcessor } from '../types';

interface QueueConfig<T> {
    name: string;
    processor: JobProcessor<T>;
    queueOptions?: QueueOptions;
    workerOptions?: WorkerOptions;
}

export class QueueManager<T> {
    private pairs: Map<string, QueueWorkerPair<T>> = new Map();
    private redisUrl: string;

    constructor(redisUrl: string) {
        this.redisUrl = redisUrl;
    }

    createQueueWorkerPair(config: QueueConfig<T>, io: Server | null): QueueWorkerPair<T> {
        const { name, processor, queueOptions, workerOptions } = config;

        const queue = new Queue<T>(name, {  // Explicitly Queue<T>
            connection: { url: this.redisUrl },
            ...queueOptions,
        });

        const worker = new Worker<T, any, string>(
            name,
            async (job) => await processor.process(job),
            {
                connection: { url: this.redisUrl },
                concurrency: 5,
                limiter: { max: 100, duration: 60000 },
                ...workerOptions,
            }
        );

        worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} in ${name} failed: ${err.message}`);
        });

        worker.on('drained', () => {
            console.log(`${name} queue drained`);
            io?.emit('queueCompleted', { queue: name });
        });

        const pair = new QueueWorkerPair<T>(queue, worker);
        this.pairs.set(name, pair);
        return pair;
    }

    getQueue(name: string): Queue<T> | undefined {  // Return Queue<T>
        return this.pairs.get(name)?.queue;
    }

    async shutdown(): Promise<void> {
        for (const pair of this.pairs.values()) {
            await pair.close();
        }
    }
}