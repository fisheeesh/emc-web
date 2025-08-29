import { Worker } from "bullmq";
import { redis } from "../../config/redis-client";
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

import dotenv from "dotenv";
dotenv.config();

const scoreWorker = new Worker("scoreQueue", async (job) => {
    const { moodMessage } = job.data

    const { text } = await generateText({
        model: groq("deepseek-r1-distill-llama-70b"),
        prompt: `
            The user has written the following message about how they feel: "${moodMessage}".

            You are an experienced professional therapist, but also fully aware of modern slang,
            casual expressions, and how people talk today.

            Your task:
            - Assign a mood score between -1 and 1.
            - Use **gradual scoring**, not just -1, 0, or 1.
            - Only assign -1 or -0.9 or -0.8 or -0.7, or 1 or 0.9 or 0.8 or 0.7 if the message is extremely clear and absolute (100% positive = 1, or 100% negative/suicidal = -1).
            - For messages that are positive but not extreme, use values like 0.6, 0.5 0.4.
            - For messages that are negative but not extreme, use values like -0.6, -0.5, -0.4.
            - For neutral, mixed, or uncertain moods, stay between -0.3 and 0.3
            - If user emotion seems like anger issues, should assign between -0.5 to -0.6 based on the level of anger.

            Important:
            - Output must be a single plain number, e.g. -0.7, 0.3, 0.9.
            - Do not return any words, explanations, or markdown.`,
        system: "You are a modern, culturally aware therapist who understands current slang and emotional nuance. Respond only with a numeric score."
    })

    return text
}, { connection: redis })

scoreWorker.on("completed", (job) => {
    console.log(`Job: ${job.id} completed`)
})

scoreWorker.on("failed", (job: any, err) => {
    console.log(`Job: ${job.id} failed`, err)
})