import { Queue, QueueEvents } from 'bullmq'
import { redis } from '../../config/redis-client'

export const RecommendationQueue = new Queue('recommendationQueue', {
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

export const RecommendationQueueEvents = new QueueEvents('recommendationQueue', {
    connection: redis
})