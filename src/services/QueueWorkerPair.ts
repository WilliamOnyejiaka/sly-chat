import { Queue, Worker } from 'bullmq';

export class QueueWorkerPair<T> {
    public readonly queue: Queue<T>;  // Use Queue<T>
    public readonly worker: Worker<T, any, string>;  // Explicitly match Worker instantiation

    constructor(
        queue: Queue<T>,
        worker: Worker<T, any, string>
    ) {
        this.queue = queue;
        this.worker = worker;
    }

    async close(): Promise<void> {
        await this.worker.close();
        await this.queue.close();
    }
}