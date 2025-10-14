import { Queue } from "bullmq";
import { redis } from "../../config/redis-client";

export const CacheQueue = new Queue("cacheQueue", {
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