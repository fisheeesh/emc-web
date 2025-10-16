import { Worker } from "bullmq";
import { redis } from "../../config/redis-client";
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

import dotenv from "dotenv";
import { createScorePrompt, createScoreSystemPrompt } from "../../utils/ai-promts";
dotenv.config();

const scoreWorker = new Worker("scoreQueue", async (job) => {
    const { moodMessage } = job.data

    const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: createScorePrompt(moodMessage),
        system: createScoreSystemPrompt()
    })

    return text
}, { connection: redis })

scoreWorker.on("completed", (job) => {
    console.log(`Job: ${job.id} completed`)
})

scoreWorker.on("failed", (job: any, err) => {
    console.log(`Job: ${job.id} failed`, err)
})