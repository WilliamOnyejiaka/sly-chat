// import { Job } from 'bullmq';
// import { PrismaClient } from '@prisma/client';
// import { Server } from 'socket.io';
// import { createClient } from 'redis';

// // Job data interface
// export interface JobData {
//     type: string;
//     chatId: string;
//     [key: string]: any; // Flexible for additional fields
// }

// // Processor interface
// export interface JobProcessor {
//     process(job: Job<JobData>): Promise<void>;
// }
// export class SendMessageProcessor implements JobProcessor {
//     constructor(private io: Server) { }

//     async process(job: Job<JobData>): Promise<void> {
//         const { chatId, content, senderId } = job.data;
//         if (!content || !senderId) throw new Error('Missing content or senderId');

//         const message = await prisma.message.create({
//             data: { content, senderId, chatId },
//         });
//         await redisClient.set(`message:${message.id}`, JSON.stringify(message), { EX: 172800 });
//         this.io.to(chatId).emit('newMessage', message);
//     }
// }

// // DeleteForEveryone processor
// export class DeleteForEveryoneProcessor implements JobProcessor {
//     constructor(private io: Server) { }

//     async process(job: Job<JobData>): Promise<void> {
//         const { chatId, messageId, senderId } = job.data;
//         if (!messageId) throw new Error('Missing messageId');

//         const messageKey = `message:${messageId}`;
//         const cachedMessage = await redisClient.get(messageKey);
//         if (!cachedMessage) {
//             this.io.to(chatId).emit('error', { message: 'Time limit exceeded or message not found' });
//             return;
//         }

//         const message = await prisma.message.findUnique({ where: { id: messageId } });
//         if (!message || message.senderId !== senderId) {
//             this.io.to(chatId).emit('error', { message: 'Unauthorized: Only the sender can delete' });
//             return;
//         }

//         await prisma.message.update({ where: { id: messageId }, data: { deleted: true } });
//         await redisClient.del(messageKey);
//         this.io.to(chatId).emit('messageDeletedForEveryone', { messageId });
//     }
// }