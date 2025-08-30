import { Worker } from "bullmq";
import { redis } from "../../config/redis-client";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

import dotenv from "dotenv";
dotenv.config();

const analysisWorker = new Worker("analysisQueue", async (job) => {
    const { input } = job.data

    const { text } = await generateText({
        model: groq("deepseek-r1-distill-llama-70b"),
        prompt: `
            The following is an employee's last 7 days of emotional check-in data:

            "${input}"

            You are a professional therapist specializing in workplace mental health. 
            You understand and can interpret emotions fluently in Burmese, English, and Thai.  
            Your role is to provide **realistic, culturally sensitive, and empathetic recommendations** 
            that HR can follow to support this employee.

            Guidelines:
            - Analyze the emotional trend and possible underlying causes.
            - Suggest **practical steps HR or a manager could take** (e.g., conversations, workload adjustments, wellness activities).
            - Recommendations must be **helpful, professional, and actionable**.
            - Provide the response in **Markdown format**, structured with bullet points or numbered steps.
            - Keep it **at least 150 characters long** to ensure sufficient depth.
            - Do not give vague generic text like "be supportive" — be **specific and realistic**.

            Return only the guidelines in Markdown format.
            `,
        system: "You are a modern therapist and workplace mental health advisor. Your job is to realistically guide HR in supporting employees based on their emotional history.",
    })

    return text
}, { connection: redis })

analysisWorker.on("completed", (job) => {
    console.log(`Job: ${job.id} completed`)
})

analysisWorker.on("failed", (job: any, err) => {
    console.log(`Job: ${job.id} failed`, err)
})