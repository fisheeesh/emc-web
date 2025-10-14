import { Queue, QueueEvents } from 'bullmq'
import { redis } from '../../config/redis-client'

export const AnalysisQueue = new Queue('analysisQueue', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: 1000
    }
})

export const AnalysisQueueEvents = new QueueEvents('analysisQueue', {
    connection: redis
})