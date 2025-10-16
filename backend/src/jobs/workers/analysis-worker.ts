import { Worker } from "bullmq";
import { redis } from "../../config/redis-client";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import dotenv from "dotenv";
import { prisma } from "../../config/prisma-client";
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
        prompt: `
Analyze the following emotional check-in data for ${employeeName} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}:

${statsInfo}

EMOTIONAL CHECK-IN ENTRIES:
${formattedCheckIns}

Based on this data, provide a comprehensive emotional analysis in the following JSON format:

{
    "overallMood": "A detailed paragraph (100-200 words) describing the employee's overall emotional state throughout the week. Mention specific patterns, peaks, dips, and overall trajectory. Reference specific check-ins when relevant.",
    "moodTrend": "A detailed paragraph (100-150 words) analyzing the emotional trend with specific percentages and comparisons. Describe whether emotions are improving, declining, or stable. Include statistical insights.",
    "keyInsights": [
        "First specific observation about timing, patterns, or triggers (be detailed and reference actual check-in data)",
        "Second insight about emotional patterns or correlations",
        "Third insight about resilience, recovery, or concerning patterns",
        "Fourth insight about work-life balance or overall wellbeing indicators"
    ],
    "recommendations": [
        "First specific, actionable recommendation for HR/manager based on the data",
        "Second practical step that addresses identified patterns",
        "Third recommendation for support or intervention",
        "Fourth suggestion for maintaining or improving wellbeing"
    ]
}

IMPORTANT INSTRUCTIONS:
- Analyze the ACTUAL data provided, don't make up information
- Be specific about times, dates, and emotional patterns you observe
- If you see critical/negative emotions, address them seriously in recommendations
- Reference specific check-ins in your analysis (e.g., "On October 14th...")
- Make insights and recommendations directly related to the observed patterns
- Keep each insight and recommendation as a complete, detailed sentence
- Return ONLY valid JSON, no markdown formatting or code blocks
- Ensure all text is professional, empathetic, and culturally sensitive
- Handle Burmese, English, and Thai feelings appropriately
`,
        system: `You are an expert workplace mental health analyst and therapist. Your role is to:
1. Carefully analyze emotional check-in data
2. Identify patterns, trends, and concerning signals
3. Provide specific, actionable insights based on actual data
4. Make realistic recommendations that HR can implement
5. Be culturally sensitive and professional
6. Return analysis in valid JSON format only

Always base your analysis on the actual data provided, not generic responses.`
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