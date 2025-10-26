import dotenv from "dotenv";
dotenv.config();

import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { Worker } from "bullmq";
import { redis } from "../../config/redis-client";
import { createRecommendationPrompt, createRecommendationSystemPrompt, EmotionCheckIn } from "../../utils/ai-promts";

interface JobData {
    empName: string,
    emotionCheckIns: EmotionCheckIn[];
}

const recommendationWorker = new Worker<JobData>("recommendationQueue", async (job) => {
    try {
        const { empName, emotionCheckIns } = job.data;

        if (!emotionCheckIns || emotionCheckIns.length === 0) {
            throw new Error("No emotion check-ins found for analysis");
        }

        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: createRecommendationPrompt(empName, emotionCheckIns),
            system: createRecommendationSystemPrompt(),
        });

        return text

    } catch (error: any) {
        console.error("Error generating AI recommendation:", error);
        throw error;
    }
}, {
    connection: redis,
    limiter: {
        max: 10,
        duration: 60000
    }
});

recommendationWorker.on("completed", (job) => {
    console.log(`Recommendation Job ${job.id} completed successfully`);
});

recommendationWorker.on("failed", (job: any, err) => {
    console.error(`Recommendation Job ${job?.id} failed:`, err.message);
});

recommendationWorker.on("progress", (job, progress) => {
    console.log(`Recommendation Job ${job.id} progress: ${progress}%`);
});

export default recommendationWorker;