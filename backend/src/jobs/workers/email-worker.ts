import dotenv from 'dotenv';
dotenv.config();

import { Worker } from "bullmq";
import fs from "fs";
import { Resend } from "resend";
import { redis } from "../../config/redis-client";
import { convertMarkdownToHTML, wrapInEmailTemplate } from "../../utils/helplers";
import axios from "axios";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.SENDER_EMAIL || "no-reply@emotioncheckinsystem.com";

type AttachmentData = {
    filename: string;
    path: string;
    contentType: string;
};

type JobPayload = {
    customName?: string,
    subject: string,
    body: string,
    to: string[],
    isMarkdown?: boolean,
    attachments?: AttachmentData[];
};

const emailWorker = new Worker<JobPayload>(
    "emailQueue",
    async (job) => {
        const allowedJobs = ["notify-email", "send-otp-email", "announcement-email"];
        if (!allowedJobs.includes(job.name)) return;

        const { customName = "EMC", subject, body, to, isMarkdown = false, attachments } = job.data;

        let htmlBody = body;
        if (isMarkdown) {
            const convertedHTML = convertMarkdownToHTML(body);
            htmlBody = wrapInEmailTemplate(convertedHTML, subject);
        }

        //* Prepare attachments for Resend
        let resendAttachments: any[] | undefined;

        if (attachments && attachments.length > 0) {
            resendAttachments = await Promise.all(attachments.map(async (att) => {
                let base64Content: string;

                //* Check if path is a URL (Cloudinary) or local file path
                if (att.path.startsWith('http://') || att.path.startsWith('https://')) {
                    //* Download file from URL and convert to base64
                    try {
                        const response = await axios.get(att.path, {
                            responseType: 'arraybuffer'
                        });
                        base64Content = Buffer.from(response.data).toString('base64');
                    } catch (error) {
                        console.error(`Failed to download attachment from URL: ${att.path}`, error);
                        throw error;
                    }
                } else {
                    //* Read local file and convert to base64
                    const fileBuffer = fs.readFileSync(att.path);
                    base64Content = fileBuffer.toString('base64');
                }

                return {
                    filename: att.filename,
                    content: base64Content,
                };
            }));
        }

        await resend.emails.send({
            from: `${customName} <${FROM}>`,
            to,
            subject,
            html: htmlBody,
            ...(resendAttachments && { attachments: resendAttachments })
        });

        //$ Clean up uploaded files after sending email -> only for local files in dev, not URLs in prod
        if (attachments && attachments.length > 0) {
            for (const att of attachments) {
                //* Only delete local files, not Cloudinary URLs
                if (!att.path.startsWith('http://') && !att.path.startsWith('https://')) {
                    try {
                        if (fs.existsSync(att.path)) {
                            fs.unlinkSync(att.path);
                            console.log(`Deleted local attachment: ${att.path}`);
                        }
                    } catch (error) {
                        console.error(`Failed to delete attachment: ${att.path}`, error);
                    }
                }
            }
        }
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