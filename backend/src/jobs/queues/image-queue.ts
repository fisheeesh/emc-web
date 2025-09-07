import { Queue } from "bullmq";
import { redis } from "../../config/redis-client";

export const ImageQueue = new Queue("imageQueue", {
    connection: redis
})