import dotenv from 'dotenv';
dotenv.config();

import { Worker } from "bullmq";
import { Resend } from "resend";
import { redis } from "../../config/redis-client";
import { convertMarkdownToHTML, wrapInEmailTemplate } from "../../utils/helplers";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.SENDER_EMAIL || "no-reply@emotioncheckinsystem.com";

type JobPayload = {
    customName?: string,
    subject: string,
    body: string,
    to: string[],
    isMarkdown?: boolean
};

const emailWorker = new Worker<JobPayload>(
    "emailQueue",
    async (job) => {
        const allowedJobs = ["notify-email", "send-otp-email", "announcement-email"];
        if (!allowedJobs.includes(job.name)) return;

        const { customName = "EMC", subject, body, to, isMarkdown = false } = job.data;

        let htmlBody = body;
        if (isMarkdown) {
            const convertedHTML = convertMarkdownToHTML(body);
            htmlBody = wrapInEmailTemplate(convertedHTML, subject);
        }

        await resend.emails.send({
            from: `${customName} <${FROM}>`,
            to,
            subject,
            html: htmlBody,
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