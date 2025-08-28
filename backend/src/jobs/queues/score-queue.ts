import { Queue, QueueEvents } from 'bullmq'
import { redis } from '../../config/redis-client'

export const ScoreQueue = new Queue('scoreQueue', {
    connection: redis
})

export const ScoreQueueEvents = new QueueEvents('scoreQueue', {
    connection: redis
})