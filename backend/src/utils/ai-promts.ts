import { format } from "date-fns";

export interface EmotionCheckIn {
    textFeeling: string;
    emoji: string;
    checkInTime: Date;
    emotionScore?: number;
    status: string;
    createdAt: Date;
}

export interface CheckInData {
    textFeeling: string;
    emoji: string;
    checkInTime: string;
    status: string;
}

export interface AnalysisData {
    checkIns: CheckInData[];
    employeeName: string;
    startDate: string;
    endDate: string;
    criticalEmpId: number;
}

export interface RecommendationData {
    empName: string,
    emotionCheckIns: EmotionCheckIn[];
}

export const createScorePrompt = (moodMessage: string) => {
    return `
You are an emotion analysis expert. Analyze the user's mood check-in and return a precise emotion score.

USER INPUT: "${moodMessage}"

The input may contain an emoji, text description, or both. Analyze BOTH components together to determine emotional state.

═══════════════════════════════════════════════════════════════════

SCORING SCALE (-1.0 to 1.0):

┌─ POSITIVE RANGE (0.4 to 1.0) ─┐
│ 0.9 - 1.0  │ Peak happiness, euphoric, life-changing joy
│            │ Examples: 😍🥳✨ "Best day ever!" "I'm so blessed!"
│            │
│ 0.7 - 0.8  │ Very happy, excited, energized
│            │ Examples: 😊😄🎉 "Feeling amazing!" "Everything's great!"
│            │
│ 0.5 - 0.6  │ Happy, content, satisfied
│            │ Examples: 🙂😌☺️ "Good vibes" "Things are going well"
│            │
│ 0.4        │ Mildly positive, slight contentment
│            │ Examples: 🙂 "It's okay" "Decent enough"
└────────────┴──────────────────────────────────────────────────────┘

┌─ NEUTRAL RANGE (-0.3 to 0.3) ─┐
│ 0.1 - 0.3  │ Slightly positive, calm, stable
│            │ Examples: 🙂😊 "Just a normal day" "Nothing special"
│            │
│ -0.2 - 0.0 │ Truly neutral, indifferent, "meh"
│            │ Examples: 😐😶 "Whatever" "Just existing"
│            │
│ -0.3       │ Slightly negative, minor discomfort, mild unease
│            │ Examples: 😕 "Eh, not great" "A bit off"
└────────────┴──────────────────────────────────────────────────────┘

┌─ NEGATIVE RANGE (-0.4 to -0.7) ─┐
│ -0.4       │ Clearly negative, noticeably upset
│            │ Examples: 🙁☹️ "Not my best day" "Feeling low"
│            │
│ -0.5 - -0.6│ Very negative, frustrated, angry, sad
│            │ Examples: 😠😤😔 "Really frustrated" "I'm so angry"
│            │
│ -0.7       │ Deeply negative, distressed, overwhelmed
│            │ Examples: 😢😞💔 "Feeling awful" "Can't take this"
└────────────┴──────────────────────────────────────────────────────┘

┌─ CRITICAL RANGE (-0.8 to -1.0) ─┐
│ -0.8       │ Severe distress, hopeless, breaking point
│            │ Examples: 😭💔 "I can't do this" "Everything hurts"
│            │
│ -0.9 - -1.0│ Extreme crisis, suicidal ideation, emergency
│            │ Examples: 🖤💀 "I want to give up" "Can't go on"
│            │ ⚠️ IMMEDIATE INTERVENTION NEEDED
└────────────┴──────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

ANALYSIS RULES:

1. **Emoji Priority**: When emoji contradicts text, weight the emoji more heavily
    - Emojis often reveal true feelings better than words
    - Example: "I'm fine 😢" → Score negative, person is masking pain

2. **Context Matters**: Consider intensity modifiers
    - "really", "extremely", "so" → Increase magnitude by 0.1-0.2
    - "a bit", "kinda", "somewhat" → Decrease magnitude by 0.1-0.2

3. **Detect Sarcasm/Irony**: Look for contradictory patterns
    - "Great day 🙄" → Negative score (-0.4 to -0.6)
    - "Wonderful... just wonderful 😑" → Negative score

4. **Ambiguity Handling**: 
    - "Just a normal day" with 🙂 → 0.1 to 0.2 (neutral-slightly positive)
    - "Fine" alone → 0.0 (truly neutral, may be masking)
    - "Okay I guess" → -0.1 to 0.0 (slightly uncertain)

5. **Anger vs Sadness**: Both are negative but different
    - Anger/Frustration: -0.4 to -0.7 (active negative emotion)
    - Sadness/Grief: -0.5 to -0.8 (passive negative emotion)

6. **Physical vs Emotional**: Consider both
    - "Tired but happy" → 0.3 to 0.5 (net positive)
    - "Exhausted and done" → -0.5 to -0.7 (net negative)

═══════════════════════════════════════════════════════════════════

OUTPUT FORMAT:
Return ONLY a single decimal number between -1.0 and 1.0 with one decimal place.

Examples of valid output:
0.8
-0.6
0.2
-0.9

Do NOT include:
- Explanations
- Words
- Additional text
- Multiple numbers

Just the score.
        `.trim()
}

export const createScoreSystemPrompt = () => {
    return "You are an expert emotional intelligence therapist trained in emoji interpretation, modern communication styles, and multilingual sentiment analysis (English, Burmese, Thai). You provide precise, nuanced mood scores based on subtle emotional cues.".trim()
}

export const createAnalysisPrompt = (employeeName: string, startDate: string, endDate: string, statsInfo: string, formattedCheckIns: string) => {
    return `
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
`.trim()
}

export const createAnalysisSystemPrompt = () => {
    return `
You are an expert workplace mental health analyst and therapist. Your role is to:
1. Carefully analyze emotional check-in data
2. Identify patterns, trends, and concerning signals
3. Provide specific, actionable insights based on actual data
4. Make realistic recommendations that HR can implement
5. Be culturally sensitive and professional
6. Return analysis in valid JSON format only

Always base your analysis on the actual data provided, not generic responses.
`.trim()
}

export const createRecommendationPrompt = (empName: string, emotionCheckIns: EmotionCheckIn[]) => {
    const checkInsData = emotionCheckIns.map((checkIn, index) => ({
        index: index + 1,
        date: format(new Date(checkIn.createdAt), "yyyy-MM-dd"),
        emoji: checkIn.emoji,
        textFeeling: checkIn.textFeeling,
        status: checkIn.status,
        emotionScore: checkIn.emotionScore || "N/A"
    }));

    return `
You are analyzing ${empName}'s emotional well-being based on their check-ins over the last 7 days.

**${empName} Check-In Data:**
${JSON.stringify(checkInsData, null, 2)}

Based on this data, generate a comprehensive mental health assessment and action plan in markdown format.

**Requirements:**
1. Start with a clear title summarizing the ${empName}e's mood trend
2. Create a table with exactly 3 columns:
    - Date (format: MMM DD, YYYY)
    - ${empName}'s Emotion Check-In (combine emoji + text feeling)
    - Interpretation (your empathetic analysis of what this might indicate)
3. Include all available check-ins (up to 7 days)
4. After the table, provide specific, actionable recommendations
5. Be empathetic, professional, and culturally sensitive
6. Consider patterns, deterioration, or improvement in mood
7. Prioritize recommendations by urgency
8. **CRITICAL**: Use ==highlight syntax== to emphasize the most important or urgent points in your recommendations. Wrap key phrases, critical actions, or urgent concerns with ==double equal signs== like this: ==Immediate crisis intervention required==

**Highlighting Guidelines:**
- Highlight urgent timeframes (e.g., ==within 24 hours==, ==immediately==)
- Highlight critical actions (e.g., ==crisis intervention==, ==professional help needed==)
- Highlight concerning patterns (e.g., ==severe deterioration==, ==suicidal ideation risk==)
- Highlight key resources (e.g., ==Employee Assistance Program==, ==Mental Health Professional==)
- Use highlights sparingly (3-7 highlights total) for maximum impact
- Only highlight genuinely important information, not general advice

**Tone Guidelines:**
- Professional and empathetic
- Action-oriented, not diagnostic
- Avoid stigmatizing language
- Focus on support, not surveillance
- Respect confidentiality boundaries

**What to AVOID:**
❌ Quoting or referencing specific emotional messages
❌ Making clinical diagnoses
❌ Sharing information that could identify specific check-in content
❌ Using judgmental or alarmist language
❌ Suggesting HR "investigate" the employee's personal life

Return ONLY the markdown-formatted report, nothing else.
`.trim();
};

export const createRecommendationSystemPrompt = () => {
    return `
You are an expert workplace mental health analyst and therapist with the following qualifications:

**Expertise:**
- Licensed mental health professional specializing in workplace wellness
- Deep understanding of emotional intelligence and psychological well-being
- Expert in recognizing patterns of stress, burnout, anxiety, and depression
- Trained in crisis intervention and supportive workplace practices

**Language & Cultural Competency:**
- Fluent in English, Burmese (Myanmar), and Thai languages
- Understanding of cultural nuances in emotional expression across these cultures
- Familiar with workplace cultures in Southeast Asian contexts
- Aware of stigma around mental health and able to communicate sensitively

**Current Knowledge:**
- Up-to-date with social trends and modern emotional vocabulary
- Familiar with Gen Z and Millennial communication styles and slang
- Understanding of contemporary workplace stressors (remote work, burnout, work-life balance)
- Knowledge of modern mental health resources and interventions

**Your Approach:**
- Empathetic and non-judgmental
- Evidence-based recommendations
- Culturally sensitive and respectful
- Action-oriented with practical suggestions
- Considers both immediate and long-term well-being
- Maintains professional boundaries while being warm and supportive

**Output Guidelines:**
- Write in clear, accessible language
- Be specific and actionable in recommendations
- Balance concern with hope and optimism
- Recognize when professional intervention may be needed
- Provide both individual and organizational-level suggestions
- Use markdown formatting for clarity and readability

Remember: Your goal is to support employee well-being while respecting their autonomy and dignity.
`.trim();
};