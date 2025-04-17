// server.ts
import cluster from "cluster";
import * as os from "os";
import createApp from "./config/app";
import { env } from "./config";
import prisma from "./repos";

let environmentType = env('envType');
const PORT = env('port');

async function startServer() {
    const app = await createApp();
    const numCpu = (os.cpus().length) - 1; // TODO: note this

    if (cluster.isPrimary) {
        for (let i = 0; i < numCpu; i++) cluster.fork();

        cluster.on('exit', (worker, code, signal) => {
            console.log(`worker ${worker.process.pid} died`);
            console.log('Starting a new worker');
            cluster.fork();
        });

        cluster.on('online', (worker) => console.log(`Worker ${worker.process.pid} is online`));
    } else {
        try {
            await prisma.$connect();
            console.log(`Worker ${process.pid} has connected to the database`);
            app.listen(PORT, () => console.log(`server running on port - ${PORT}\n`));
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            process.exit(1); // Exit if connection fails
        }
    }
}

(async () => {
    if (environmentType === "dev") {
        try {
            await prisma.$connect();
            console.log('Connected to the database');
            (await createApp()).listen(PORT, () => console.log(`server running on port - ${PORT}`));
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            process.exit(1); // Exit if connection fails
        }
    } else {
        await startServer();
    }
})();


// async function connectWithRetry(maxRetries = 3, delay = 1000) {
//     for (let i = 0; i < maxRetries; i++) {
//         try {
//             await prisma.$connect();
//             console.log(`Worker ${process.pid} connected to the database`);
//             return;
//         } catch (error) {
//             console.error(`Worker ${process.pid} failed to connect (attempt ${i + 1}):`, error);
//             if (i < maxRetries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
//         }
//     }
//     throw new Error('Max retries reached');
// }

// async function startServer() {
//     const app = await createApp();
//     const numCpu = os.cpus().length;

//     if (cluster.isPrimary) {
//         console.log(`Primary ${process.pid} is running with ${numCpu} workers`);
//         for (let i = 0; i < numCpu; i++) cluster.fork();

//         cluster.on('exit', (worker, code, signal) => {
//             console.log(`Worker ${worker.process.pid} died with code ${code}, signal ${signal}`);
//             console.log('Starting a new worker');
//             cluster.fork();
//         });

//         cluster.on('online', (worker) => console.log(`Worker ${worker.process.pid} is online`));
//     } else {
//         try {
//             // Handle uncaught errors
//             process.on('uncaughtException', (error) => {
//                 console.error(`Uncaught Exception in worker ${process.pid}:`, error);
//                 process.exit(1);
//             });
//             process.on('unhandledRejection', (reason, promise) => {
//                 console.error(`Unhandled Rejection in worker ${process.pid}:`, reason);
//                 process.exit(1);
//             });

//             await connectWithRetry();
//             const server = app.listen(PORT, () => console.log(`Worker ${process.pid} running on port ${PORT}`));

//             // Graceful shutdown
//             process.on('SIGTERM', async () => {
//                 console.log(`Worker ${process.pid} shutting down`);
//                 server.close();
//                 await prisma.$disconnect();
//                 process.exit(0);
//             });
//         } catch (error) {
//             console.error(`Worker ${process.pid} failed with error:`, error);
//             await prisma.$disconnect();
//             process.exit(1);
//         }
//     }
// }