import { Worker } from "bullmq";
import { redis } from "../../config/redis-client";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import dotenv from "dotenv";
import { prisma } from "../../config/prisma-client";
import { createAnalysisPrompt, createAnalysisSystemPrompt } from "../../utils/ai-promts";
dotenv.config();

interface CheckInData {
    textFeeling: string;
    emoji: string;
    checkInTime: string;
    status: string;
}

interface JobData {
    checkIns: CheckInData[];
    employeeName: string;
    startDate: string;
    endDate: string;
    criticalEmpId: number;
}

const analysisWorker = new Worker("analysisQueue", async (job) => {
    const { checkIns, employeeName, startDate, endDate, criticalEmpId }: JobData = job.data

    //* Format check-ins for the prompt
    const formattedCheckIns = checkIns.map((checkIn, index) =>
        `${index + 1}. ${checkIn.checkInTime} - Status: ${checkIn.status.toUpperCase()}
        Emoji: ${checkIn.emoji}
        Feeling: "${checkIn.textFeeling}"`
    ).join("\n\n")

    //* Calculate basic statistics
    const totalCheckIns = checkIns.length
    const statusCounts = checkIns.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const statsInfo = `
            Total Check-ins: ${totalCheckIns}
            Status Breakdown:
            - Critical: ${statusCounts.critical || 0} (${((statusCounts.critical || 0) / totalCheckIns * 100).toFixed(1)}%)
            - Negative: ${statusCounts.negative || 0} (${((statusCounts.negative || 0) / totalCheckIns * 100).toFixed(1)}%)
            - Neutral: ${statusCounts.neutral || 0} (${((statusCounts.neutral || 0) / totalCheckIns * 100).toFixed(1)}%)
            - Positive: ${statusCounts.positive || 0} (${((statusCounts.positive || 0) / totalCheckIns * 100).toFixed(1)}%)
        `

    const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: createAnalysisPrompt(employeeName, startDate, endDate, statsInfo, formattedCheckIns),
        system: createAnalysisSystemPrompt()
    })

    //* Parse the JSON response
    let analysis
    try {
        //* Clean the response in case there's markdown formatting
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        analysis = JSON.parse(cleanedText)
    } catch (error) {
        console.error("Failed to parse AI response:", text)
        throw new Error("Invalid AI response format")
    }

    //* Save to database
    const savedAnalysis = await prisma.aIAnalysis.create({
        data: {
            criticalId: criticalEmpId,
            overallMood: analysis.overallMood,
            moodTrend: analysis.moodTrend,
            keyInsights: analysis.keyInsights,
            recommendations: analysis.recommendations,
            weekRange: `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        }
    })

    return {
        id: savedAnalysis.id,
        empName: employeeName,
        overallMood: analysis.overallMood,
        moodTrend: analysis.moodTrend,
        keyInsights: analysis.keyInsights,
        recommendations: analysis.recommendations,
        weekRange: savedAnalysis.weekRange
    }
}, {
    connection: redis,
    limiter: {
        max: 10,
        duration: 60000
    }
})

analysisWorker.on("completed", (job) => {
    console.log(`Analysis Job ${job.id} completed successfully`)
})

analysisWorker.on("failed", (job: any, err) => {
    console.error(`Analysis Job ${job.id} failed:`, err.message)
})

analysisWorker.on("progress", (job, progress) => {
    console.log(`Analysis Job ${job.id} progress: ${progress}%`)
})

export default analysisWorker