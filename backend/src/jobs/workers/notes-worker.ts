import { Worker } from "bullmq";
import { redis } from "../../config/redis-client";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import dotenv from "dotenv";
import { createNotesPrompt, createNotesSystemPrompt, EmotionCheckIn } from "../../utils/ai-promts";
dotenv.config();

interface JobData {
    empName: string,
    emotionCheckIns: EmotionCheckIn[];
}

const notesWorker = new Worker<JobData>("notesQueue", async (job) => {
    try {
        const { empName, emotionCheckIns } = job.data;

        if (!emotionCheckIns || emotionCheckIns.length === 0) {
            throw new Error("No emotion check-ins found for analysis");
        }

        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: createNotesPrompt(empName, emotionCheckIns),
            system: createNotesSystemPrompt(),
        });

        return text

    } catch (error: any) {
        console.error("Error generating AI notes:", error);
        throw error;
    }
}, {
    connection: redis,
    limiter: {
        max: 10,
        duration: 60000
    }
});

notesWorker.on("completed", (job) => {
    console.log(`Notes Job ${job.id} completed successfully`);
});

notesWorker.on("failed", (job: any, err) => {
    console.error(`Notes Job ${job?.id} failed:`, err.message);
});

notesWorker.on("progress", (job, progress) => {
    console.log(`Notes Job ${job.id} progress: ${progress}%`);
});

export default notesWorker;