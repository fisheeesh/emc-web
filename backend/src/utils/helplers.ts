import { toZonedTime } from 'date-fns-tz';
import { TIMEZONE } from '../config';
import path from "path"
import { unlink } from "node:fs/promises";
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

export const calculatePositiveStreak = (scores: number[]): number => {
    let streak = 0;
    for (const s of scores) {
        if (s >= 0.3) {
            streak++;
        } else {
            return 0
        }
    }
    return streak >= 3 ? streak : 0
};

export function getStatusFromScore(score: number) {
    if (score >= 0.4) return 'positive';
    if (score >= -0.3) return 'neutral';
    if (score > -0.8) return 'negative';
    return 'critical';
}

export const departmentFilter = (role: string, uDepartmentId: number, qDepartmentId?: string) => {
    return role !== 'SUPERADMIN'
        ? { employee: { departmentId: uDepartmentId } }
        : qDepartmentId && qDepartmentId !== 'all'
            ? { employee: { departmentId: Number(qDepartmentId) } }
            : {};
}

export const determineReputation = (score: number, streak: number = 0) => {
    let basePoints = 0;

    if (score >= 0.4) {
        basePoints = 1000;
    } else if (score >= 0) {
        basePoints = 500;
    } else if (score >= -0.3) {
        basePoints = 250;
    } else if (score > -0.8) {
        basePoints = -200;
    } else {
        basePoints = -500;
    }

    if (score >= 0 && streak >= 3) {
        return basePoints * streak;
    }

    return basePoints;
};

export const getEmotionRange = (status: string) => {
    switch (status) {
        case "positive":
            return { gte: 0.4 };
        case "neutral":
            return { gte: -0.3, lte: 0.39 };
        case "negative":
            return { gte: -0.79, lte: -0.31 };
        case "critical":
            return { lte: -0.8 };
        default:
            return undefined;
    }
};

export const removeFiles = async (originalFile: string, optimizeFile?: string | null) => {
    try {
        const originalFilePath = path.join(
            __dirname,
            "../../",
            "/uploads/images",
            originalFile
        )
        await unlink(originalFilePath)

        if (optimizeFile) {
            const optimizeFilePath = path.join(
                __dirname,
                "../../",
                "/uploads/optimizes",
                optimizeFile
            )
            await unlink(optimizeFilePath)
        }

    } catch (error) {
        console.log(error)
    }
}

export function roundToHour(date: Date): string {
    //* UTC -> Thai
    const zoned = toZonedTime(date, TIMEZONE);

    let h = zoned.getHours();
    const m = zoned.getMinutes();

    if (m > 30) h += 1;
    if (h > 23) h = 23;

    return `${String(h).padStart(2, '0')}:00`;
}

export const getNotificationContent = (status: string, empName: string, emailType: string) => {
    if (emailType === 'UPDATE') {
        return `Additional suggestions have been added to the action plan for critical employee - ${empName}. Please review the updated recommendations.`;
    }

    if (emailType === 'REJECTED_DELETE') {
        return `The rejected action plan for ${empName} has been removed. You can now create a new action plan with the necessary improvements.`;
    }

    switch (status.toUpperCase()) {
        case 'APPROVED':
            return `Your action plan for critical employee - ${empName} has been approved by upper management. You can now proceed with the process! Keep up the great work! 💪`;
        case 'REJECTED':
            return `Sorry, your action plan for critical employee - ${empName} has been rejected. Please contact the HR department for more information and guidance.`;
        default:
            return `Your action plan for critical employee - ${empName} has been updated to ${status}.`;
    }
}

interface ConcernWord {
    word: string
    count: number
}

interface ConcernAnalysisResult {
    concerns: ConcernWord[]
    recommendation: string
}

export const analyzeConcernWords = async (emotionTexts: string[]): Promise<ConcernAnalysisResult> => {
    if (emotionTexts.length === 0) {
        return {
            concerns: [],
            recommendation: ''
        }
    }

    const allTexts = emotionTexts
        .filter(text => text && text.trim().length > 0)
        .join('\n---\n')

    try {
        const { text } = await generateText({
            model: groq("llama-3.3-70b-versatile"),
            prompt: `
You are an HR analyst examining employee emotion check-in texts to identify workplace concerns.

Employee Check-in Texts:
"""
${allTexts}
"""

Task 1: Extract the EXACT concern-related words/phrases employees actually used in their texts.

Rules:
- Extract ONLY the exact words/phrases employees wrote (do NOT paraphrase or group)
- Only include concern/problem words (ignore positive words like "happy", "excited", "great")
- Extract words as they appear: if employee wrote "frustrated", return "frustrated" (not "frustration")
- If employee wrote "so much things to do", extract "things to do" or "much to do"
- Keep the exact wording employees used (tired → tired, not fatigue)
- Count how many times each EXACT word/phrase appears
- Include phrases up to 3 words maximum
- Minimum 2 mentions to be included
- Be workplace-focused (ignore personal life mentions)
- Extract meaningful keywords only (skip filler words like "I", "am", "the", "a", "is", "today")

Examples:
- Employee wrote "I feel frustrated" → extract "frustrated"
- Employee wrote "I am tired" → extract "tired"
- Employee wrote "too much work" → extract "much work" or "work"
- Employee wrote "I feel depressed" → extract "depressed"

Task 2: Provide ONE actionable recommendation based on the most frequently mentioned concern.

The recommendation should:
- Be specific and actionable (not generic advice)
- Address the root cause
- Be 1-2 sentences maximum
- Focus on what management/HR can do

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
    "concerns": [
        { "word": "frustrated", "count": 5 },
        { "word": "tired", "count": 4 },
        { "word": "work", "count": 3 }
    ],
    "recommendation": "Consider addressing workload distribution and resource allocation to reduce employee frustration levels."
}
`,
            temperature: 0.2
        })

        //* Parse AI response
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const result: ConcernAnalysisResult = JSON.parse(cleanText)

        return result

    } catch (error) {
        console.error('Failed to analyze concern words:', error)
        throw new Error('AI analysis failed')
    }
}