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