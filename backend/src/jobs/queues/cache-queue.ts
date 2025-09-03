import { Queue } from "bullmq";
import { redis } from "../../config/redis-client";

export const CacheQueue = new Queue("cacheQueue", {
    connection: redis
})