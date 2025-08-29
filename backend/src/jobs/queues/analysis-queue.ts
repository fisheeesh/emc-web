import { Queue, QueueEvents } from 'bullmq'
import { redis } from '../../config/redis-client'

export const AnalysisQueue = new Queue('analysisQueue', {
    connection: redis
})

export const AnalysisQueueEvents = new QueueEvents('analysisQueue', {
    connection: redis
})