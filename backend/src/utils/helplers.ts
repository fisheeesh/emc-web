import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { endOfDay, startOfDay, subDays, subMonths } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { marked } from 'marked';
import { unlink } from "node:fs/promises";
import path from "path";
import { TIMEZONE } from '../config';

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

export const getDateRangeFromTimeRange = (timeRange: string | number) => {
    const now = new Date()
    let start: Date

    if (+timeRange === 90) {
        start = startOfDay(subMonths(now, 3))
    } else {
        start = startOfDay(subDays(now, +timeRange - 1))
    }

    const end = endOfDay(now)

    return { start, end }
}

export function getStatusFromScore(score: number) {
    if (score >= 0.4) return 'positive';
    if (score >= -0.3) return 'neutral';
    if (score > -0.8) return 'negative';
    return 'critical';
}

export const departmentFilter = (role: string, uDepartmentId: number, qDepartmentId?: string) => {
    return role !== 'SUPERADMIN'
        ? {
            employee: {
                departmentId: uDepartmentId,
            }
        }
        : qDepartmentId && qDepartmentId !== 'all'
            ? {
                employee: {
                    departmentId: Number(qDepartmentId),
                    department: {
                        isActive: true
                    }
                }
            }
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
    if (emailType === 'UPDATE' && status === 'APPROVED') {
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

/**
 * Convert markdown content to HTML for email rendering
 * Handles bold, italic, links, lists, tables, highlights, admonitions, etc.
 */
export const convertMarkdownToHTML = (markdown: string): string => {
    // Pre-process markdown to handle custom syntax
    let processedMarkdown = markdown;

    // Convert ==highlight== to <mark>highlight</mark>
    processedMarkdown = processedMarkdown.replace(/==([^=]+)==/g, '<mark>$1</mark>');

    // Convert ~~strikethrough~~ to <del>strikethrough</del>
    processedMarkdown = processedMarkdown.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // Convert admonitions :::type content ::: to styled divs
    // Supports: tip, note, info, warning, danger, caution
    processedMarkdown = processedMarkdown.replace(
        /:::(\w+)\s*\n([\s\S]*?):::/g,
        (match, type, content) => {
            const typeConfig = getAdmonitionConfig(type.toLowerCase());
            return `<div class="admonition admonition-${type}" data-type="${type}">
                <div class="admonition-heading">${typeConfig.icon} ${typeConfig.title}</div>
                <div class="admonition-content">${content.trim()}</div>
            </div>`;
        }
    );

    // Configure marked options
    marked.setOptions({
        // Convert \n to <br>
        breaks: true,
        // GitHub Flavored Markdown
        gfm: true,
    });

    // Convert markdown to HTML
    const html = marked(processedMarkdown);

    // Add inline styles for better email compatibility
    const styledHTML = addEmailStyles(html as string);

    return styledHTML;
};

/**
 * Get configuration for admonition types
 */
const getAdmonitionConfig = (type: string): { title: string; icon: string; color: string; bgColor: string } => {
    const configs: Record<string, { title: string; icon: string; color: string; bgColor: string }> = {
        tip: { title: 'Tip', icon: '💡', color: '#0066cc', bgColor: '#e3f2fd' },
        note: { title: 'Note', icon: '📝', color: '#5e35b1', bgColor: '#f3e5f5' },
        info: { title: 'Info', icon: 'ℹ️', color: '#0288d1', bgColor: '#e1f5fe' },
        warning: { title: 'Warning', icon: '⚠️', color: '#f57c00', bgColor: '#fff3e0' },
        danger: { title: 'Danger', icon: '🚨', color: '#d32f2f', bgColor: '#ffebee' },
        caution: { title: 'Caution', icon: '⚡', color: '#f57f17', bgColor: '#fffde7' },
    };

    return configs[type] || configs.note;
};

/**
 * Add inline CSS styles for email compatibility
 * Most email clients don't support external CSS or <style> tags well
 */
const addEmailStyles = (html: string): string => {
    // First, style admonitions with their specific colors
    html = html.replace(
        /<div class="admonition admonition-(\w+)" data-type="(\w+)">/g,
        (match, type) => {
            const config = getAdmonitionConfig(type.toLowerCase());
            return `<div style="border-left: 4px solid ${config.color}; background-color: ${config.bgColor}; padding: 16px 20px; margin: 16px 0; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">`;
        }
    );

    html = html.replace(
        /<div class="admonition-heading">/g,
        '<div style="font-weight: 600; font-size: 15px; margin-bottom: 8px; color: #1a1a1a;">'
    );

    html = html.replace(
        /<div class="admonition-content">/g,
        '<div style="font-size: 14px; line-height: 1.6; color: #333333;">'
    );

    return html
        // Style headers - more formal
        .replace(/<h1>/g, '<h1 style="color: #1a1a1a; font-size: 28px; font-weight: 600; margin: 24px 0 16px 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif;">')
        .replace(/<h2>/g, '<h2 style="color: #2d2d2d; font-size: 22px; font-weight: 600; margin: 20px 0 12px 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif;">')
        .replace(/<h3>/g, '<h3 style="color: #333333; font-size: 18px; font-weight: 600; margin: 16px 0 10px 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif;">')
        .replace(/<h4>/g, '<h4 style="color: #404040; font-size: 16px; font-weight: 600; margin: 14px 0 8px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif;">')

        // Style paragraphs - professional spacing
        .replace(/<p>/g, '<p style="color: #333333; font-size: 15px; line-height: 1.7; margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif;">')

        // Style links - professional blue
        .replace(/<a /g, '<a style="color: #0066cc; text-decoration: none; border-bottom: 1px solid #0066cc;" ')

        // Style bold - darker for emphasis
        .replace(/<strong>/g, '<strong style="font-weight: 600; color: #1a1a1a;">')

        // Style italic
        .replace(/<em>/g, '<em style="font-style: italic; color: #555555;">')

        // Style highlight - yellow background
        .replace(/<mark>/g, '<mark style="background-color: #fff59d; color: #000000; padding: 2px 4px; border-radius: 2px;">')

        // Style strikethrough
        .replace(/<del>/g, '<del style="text-decoration: line-through; color: #999999;">')

        // Style underline
        .replace(/<u>/g, '<u style="text-decoration: underline; text-decoration-color: #333333;">')

        // Style lists - professional spacing
        .replace(/<ul>/g, '<ul style="margin: 12px 0; padding-left: 28px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif;">')
        .replace(/<ol>/g, '<ol style="margin: 12px 0; padding-left: 28px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif;">')
        .replace(/<li>/g, '<li style="color: #333333; font-size: 15px; margin-bottom: 6px; line-height: 1.7;">')

        // Style blockquotes - formal
        .replace(/<blockquote>/g, '<blockquote style="border-left: 3px solid #0066cc; margin: 16px 0; padding: 12px 20px; color: #555555; font-style: italic; background-color: #f8f9fa; border-radius: 4px;">')

        // Style tables - professional
        .replace(/<table>/g, '<table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Arial, sans-serif; border: 1px solid #dddddd;">')
        .replace(/<thead>/g, '<thead style="background-color: #f5f5f5;">')
        .replace(/<th>/g, '<th style="border: 1px solid #dddddd; padding: 12px; background-color: #f5f5f5; font-weight: 600; text-align: left; color: #1a1a1a; font-size: 14px;">')
        .replace(/<td>/g, '<td style="border: 1px solid #dddddd; padding: 12px; color: #333333; font-size: 14px;">')

        // Style horizontal rules
        .replace(/<hr>/g, '<hr style="border: none; border-top: 1px solid #dddddd; margin: 24px 0;">');
};

/**
 * Wrap the HTML content in a formal, professional email template
 */
export const wrapInEmailTemplate = (htmlContent: string, subject: string): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; color: #333333;">
    
    <!-- Content Section -->
    <div style="max-width: 700px; margin: 0;">
        ${htmlContent}
    </div>
    
    <!-- Footer Section -->
    <div style="max-width: 700px; margin: 32px 0 0 0; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0 0 8px 0; color: #666666; font-size: 13px; line-height: 1.6;">
            <strong>Emotion Check-In System</strong>
        </p>
        <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
            This is an automated announcement. Please do not reply to this email.<br>
            If you have any questions, please contact your HR department.
        </p>
    </div>
    
    <!-- Bottom Disclaimer -->
    <div style="max-width: 700px; margin: 16px 0 0 0;">
        <p style="margin: 0; color: #999999; font-size: 11px; line-height: 1.5;">
            © ${new Date().getFullYear()} Emotion Check-In System. All rights reserved.
        </p>
    </div>

</body>
</html>
    `.trim();
};