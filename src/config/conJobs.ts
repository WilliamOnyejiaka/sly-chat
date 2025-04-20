import cron from 'node-cron';
import streamRouter from './redisStream';

const task1 = cron.schedule('*/1 * * * *', async () => {
    console.log('Starting dlq reprocessing');
    await streamRouter.startDlqReprocessing();
}, {
    scheduled: true,
    timezone: 'UTC'
});

const task2 = cron.schedule('*/5 * * * *', async () => {
    console.log('Starting dlq clean up');
    await streamRouter.startDlqCleanup();
}, {
    scheduled: true,
    timezone: 'UTC'
});


// Export tasks to control them (e.g., start/stop)
const cronJobs = {
    start: () => {
        task1.start();
        task2.start();
        console.log('Cron jobs started');
    },
    stop: () => {
        task1.stop();
        task2.stop();
        console.log('Cron jobs stopped');
    },
};

export default cronJobs;