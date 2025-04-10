import { Queue, Worker, Job } from 'bullmq';
import { env } from '.';

export const messageQueue = new Queue('message-queue', {
    connection: { url: env('redisURL')! },
});

export const sendMessage = new Queue('send-message', {
    connection: { url: env('redisURL')! },
});

export const updateChat = new Queue('update-chat', {
    connection: { url: env('redisURL')! },
});