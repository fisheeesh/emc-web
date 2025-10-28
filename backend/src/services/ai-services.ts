import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { prisma } from "../config/prisma-client";
import {
    AnalysisData,
    createAnalysisPrompt,
    createAnalysisSystemPrompt,
    createRecommendationPrompt,
    createRecommendationSystemPrompt,
    createScorePrompt,
    createScoreSystemPrompt,
    RecommendationData
} from "../utils/ai-promts";
import { parseScore } from "../utils/helplers";

export const calculateEmotionScoreWithAI = async (moodMessage: string) => {
    const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: createScorePrompt(moodMessage),
        system: createScoreSystemPrompt()
    })

    return parseScore(text);
}

export const generateAIAnalysisData = async ({ checkIns, employeeName, startDate, endDate, criticalEmpId }: AnalysisData) => {
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
}

export const genereateAIRecommendationData = async ({ empName, emotionCheckIns }: RecommendationData) => {
    try {
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
}