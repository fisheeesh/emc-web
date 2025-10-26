import { Worker } from "bullmq";
import path from "path";
import sharp from "sharp";
import { redis } from "../../config/redis-client";

const imageWorker = new Worker("imageQueue", async (job) => {
    const { filePath, fileName, width, height, quality } = job.data

    const optimizeFilePath = path.join(
        __dirname,
        "../../../",
        "/uploads/optimizes",
        fileName
    )

    await sharp(filePath)
        .resize(width, height)
        .webp({ quality })
        .toFile(optimizeFilePath)

}, { connection: redis })

imageWorker.on("completed", (job) => {
    console.log(`Job: ${job.id} completed`)
})

imageWorker.on("failed", (job: any, err) => {
    console.log(`Job: ${job.id} failed`, err)
})