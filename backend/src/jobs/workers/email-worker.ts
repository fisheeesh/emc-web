import dotenv from 'dotenv';
dotenv.config();

import { Worker } from "bullmq";
import { Resend } from "resend";
import { redis } from "../../config/redis-client";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.SENDER_EMAIL || "no-reply@emotioncheckinsystem.com"

type JobPayload = {
    subject: string,
    body: string,
    to: string[]
};

const emailWorker = new Worker<JobPayload>(
    "emailQueue",
    async (job) => {
        const allowedJobs = ["notify-email", "send-otp-email"];
        if (!allowedJobs.includes(job.name)) return;

        const { subject, body, to } = job.data;

        await resend.emails.send({
            from: FROM,
            to,
            subject,
            html: body,
        });
    },
    { connection: redis, concurrency: 5 }
);

emailWorker.on("completed", (job) => {
    console.log(`Job: ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
    console.log(`Job: ${job?.id} failed`, err);
});

export default emailWorker;