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

export interface ScoreSettings {
    positiveMin: number;
    positiveMax: number;
    neutralMin: number;
    neutralMax: number;
    negativeMin: number;
    negativeMax: number;
    criticalMin: number;
    criticalMax: number;
}

// export const createScorePrompt = (moodMessage: string, settings: ScoreSettings) => {
//     const {
//         positiveMax,
//         positiveMin,
//         neutralMax,
//         neutralMin,
//         negativeMax,
//         negativeMin,
//         criticalMax,
//         criticalMin
//     } = settings;

//     //$ Calculate mid-points for granular scoring
//     const highPositive = Number(((positiveMax + positiveMin) * 0.75 + positiveMax * 0.25).toFixed(1));
//     const midPositive = Number(((positiveMax + positiveMin) / 2).toFixed(1));
//     const lowPositive = positiveMin;

//     const highNeutral = neutralMax;
//     const midNeutral = Number(((neutralMax + neutralMin) / 2).toFixed(1));
//     const lowNeutral = neutralMin;

//     const highNegative = negativeMax;
//     const midNegative = Number(((negativeMax + negativeMin) / 2).toFixed(1));
//     const lowNegative = negativeMin;

//     const highCritical = criticalMax;
//     const lowCritical = criticalMin;

//     return `
// You are an emotion analysis expert. Analyze the user's mood check-in and return a precise emotion score.

// USER INPUT: "${moodMessage}"

// INPUT FORMAT: The message follows this structure:
// [EMOJI]([EMOTION_LABEL]) // [USER_DESCRIPTION]

// Example: "😊(I'm glad) // I feel proud of myself today"
// Example: "😭(I'm happy) // I finally achieved my goal!"

// CRITICAL: The EMOTION_LABEL in parentheses is the PRIMARY indicator of the user's true emotional state. It overrides potential emoji ambiguity.

// ═══════════════════════════════════════════════════════════════════

// SCORING SCALE (${criticalMin} to ${positiveMax}):

// ┌─ POSITIVE RANGE (${positiveMin} to ${positiveMax}) ─┐
// │ ${highPositive} - ${positiveMax}  │ Peak happiness, euphoric, life-changing joy
// │                   │ Labels: "ecstatic", "overjoyed", "blessed", "amazing", "euphoric"
// │                   │ Examples: 😍(I'm ecstatic) // Best day ever!
// │                   │
// │ ${midPositive} - ${Number((highPositive - 0.1).toFixed(1))}  │ Very happy, excited, energized, proud
// │                   │ Labels: "excited", "very happy", "proud", "grateful", "thrilled"
// │                   │ Examples: 😊(I'm proud) // I accomplished something big
// │                   │
// │ ${Number((lowPositive + 0.1).toFixed(1))} - ${Number((midPositive - 0.1).toFixed(1))}  │ Happy, content, satisfied, good
// │                   │ Labels: "happy", "glad", "content", "good", "satisfied", "pleased"
// │                   │ Examples: 🙂(I'm glad) // Things are going well
// │                   │
// │ ${lowPositive}            │ Mildly positive, slight contentment
// │                   │ Labels: "okay", "decent", "alright" (with positive context)
// │                   │ Examples: 🙂(I'm okay) // It's a decent day
// └───────────────────┴──────────────────────────────────────────────┘

// ┌─ NEUTRAL RANGE (${neutralMin} to ${neutralMax}) ─┐
// │ ${Number((midNeutral + 0.1).toFixed(1))} - ${highNeutral}  │ Slightly positive, calm, stable
// │                   │ Labels: "calm", "peaceful", "fine", "normal", "stable"
// │                   │ Examples: 😐(I'm fine) // Just a normal day
// │                   │
// │ ${Number((lowNeutral + 0.1).toFixed(1))} - ${midNeutral}  │ Truly neutral, indifferent, "meh"
// │                   │ Labels: "neutral", "meh", "indifferent", "whatever", "blank"
// │                   │ Examples: 😶(I'm neutral) // Nothing much happening
// │                   │
// │ ${lowNeutral}            │ Slightly negative, minor discomfort, mild unease
// │                   │ Labels: "uneasy", "uncomfortable", "off", "blah", "weird"
// │                   │ Examples: 😕(I'm uncomfortable) // Something feels off
// └───────────────────┴──────────────────────────────────────────────┘

// ┌─ NEGATIVE RANGE (${negativeMin} to ${negativeMax}) ─┐
// │ ${highNegative}            │ Clearly negative, noticeably upset
// │                   │ Labels: "upset", "down", "low", "disappointed", "bummed"
// │                   │ Examples: 🙁(I'm disappointed) // Not my best day
// │                   │
// │ ${midNegative} - ${Number((highNegative + 0.1).toFixed(1))} │ Very negative, frustrated, angry, sad
// │                   │ Labels: "frustrated", "angry", "sad", "stressed", "miserable"
// │                   │ Examples: 😠(I'm angry) // Really frustrated right now
// │                   │
// │ ${lowNegative}            │ Deeply negative, distressed, overwhelmed
// │                   │ Labels: "overwhelmed", "distressed", "really sad", "devastated"
// │                   │ Examples: 😢(I'm overwhelmed) // Can't take this anymore
// └───────────────────┴──────────────────────────────────────────────┘

// ┌─ CRITICAL RANGE (${criticalMin} to ${Number((highCritical + 0.1).toFixed(1))}) ─┐
// │ ${highCritical}            │ Severe distress, hopeless, breaking point
// │                   │ Labels: "hopeless", "broken", "desperate", "terrible", "helpless"
// │                   │ Examples: 😭(I'm hopeless) // I can't do this
// │                   │
// │ ${criticalMin} - ${Number((highCritical - 0.1).toFixed(1))} │ Extreme crisis, suicidal ideation, emergency
// │                   │ Labels: "suicidal", "done", "want to die", "can't go on"
// │                   │ Examples: 😰(I'm done) // I can't go on
// │                   │ ⚠️ IMMEDIATE INTERVENTION NEEDED
// └───────────────────┴──────────────────────────────────────────────┘

// ═══════════════════════════════════════════════════════════════════

// ANALYSIS RULES:

// 1. **EMOTION LABEL IS PRIMARY**: The label in parentheses is the ground truth
//     - ALWAYS prioritize the emotion label over emoji interpretation
//     - Example: "😭(I'm happy) // Finally achieved my goal!" → POSITIVE (${midPositive}-${highPositive})
//     - Example: "😊(I'm devastated) // Everything fell apart" → NEGATIVE (${lowNegative} to ${highCritical})
//     - The emoji adds context but the LABEL determines the base sentiment

// 2. **Use Description for INTENSITY**: The user's text description refines the score magnitude
//     - "really", "extremely", "so", "very" → Increase magnitude by 0.1-0.2
//     - "a bit", "kinda", "somewhat", "slightly" → Decrease magnitude by 0.1-0.2
//     - Example: "😊(I'm happy) // I'm REALLY proud!" → ${midPositive}-${highPositive} (not just ${lowPositive}-${midPositive})
//     - Example: "😔(I'm sad) // Just a bit down" → ${highNegative} (not ${midNegative})

// 3. **Emoji as Context Modifier**: Once you know the emotion from the label, use emoji for nuance
//     - Matching emoji + label → Standard score for that emotion
//     - Contrasting emoji + label → May indicate mixed feelings or irony, but LABEL still wins
//     - Example: "😂(I'm stressed) // Laughing through the pain" → ${midNegative} (stressed, but coping)

// 4. **Ambiguity Resolution**: The label eliminates ambiguity
//     - No more guessing if "fine" means good or masking pain
//     - "😐(I'm fine) // Just a normal day" → ${Number((midNeutral + 0.1).toFixed(1))} to ${highNeutral} (truly fine)
//     - "😐(I'm struggling) // Pretending everything's okay" → ${midNegative} to ${lowNegative} (masking pain)

// 5. **Multiple Emotions**: If description shows complexity, balance them
//     - "😊(I'm grateful) // Grateful but exhausted" → ${lowPositive}-${Number((midPositive - 0.1).toFixed(1))} (positive but tempered)
//     - "😔(I'm sad) // Sad but hopeful" → ${lowNeutral} to ${highNegative} (negative but not severe)

// 6. **Physical vs Emotional States**: 
//     - If label is emotional and description mentions physical: emotion wins
//     - "😴(I'm happy) // Tired but accomplished" → ${Number((lowPositive + 0.1).toFixed(1))}-${Number((midPositive - 0.1).toFixed(1))} (happy, despite fatigue)
//     - "😫(I'm exhausted) // Just drained" → ${highNegative} to ${midNegative} (negative physical state affecting mood)

// ═══════════════════════════════════════════════════════════════════

// DECISION PROCESS:

// Step 1: Extract the EMOTION LABEL from parentheses → This sets the base sentiment (positive/negative/neutral/critical)
// Step 2: Determine base score range from the label using the scale above
// Step 3: Read the user description for intensity modifiers (really, very, a bit, etc.)
// Step 4: Adjust score within the range based on intensity
// Step 5: Consider emoji for additional context (irony, mixed feelings)

// Example Analysis:
// Input: "😭(I'm happy) // I'm SO happy I finally got the job!"
// - Step 1: Label = "happy" → POSITIVE sentiment
// - Step 2: "happy" → base range ${Number((lowPositive + 0.1).toFixed(1))}-${Number((midPositive - 0.1).toFixed(1))}
// - Step 3: "SO happy" → strong intensifier
// - Step 4: Increase to ${midPositive}-${highPositive}
// - Step 5: 😭 = happy tears, reinforces joy
// - OUTPUT: ${Number((midPositive + 0.1).toFixed(1))} or ${highPositive}

// ═══════════════════════════════════════════════════════════════════

// OUTPUT FORMAT:
// Return ONLY a single decimal number between ${criticalMin} and ${positiveMax} with one decimal place.

// Examples of valid output:
// ${highPositive}
// ${midNegative}
// ${midNeutral}
// ${highCritical}

// Do NOT include:
// - Explanations
// - Words
// - Additional text
// - Multiple numbers

// Just the score.
//         `.trim();
// }
export const createScorePrompt = (moodMessage: string, settings: ScoreSettings) => {
    const {
        positiveMax,
        positiveMin,
        neutralMax,
        neutralMin,
        negativeMax,
        negativeMin,
        criticalMax,
        criticalMin
    } = settings;

    const midPositive = Number(((positiveMax + positiveMin) / 2).toFixed(1));
    const midNeutral = Number(((neutralMax + neutralMin) / 2).toFixed(1));
    const midNegative = Number(((negativeMax + negativeMin) / 2).toFixed(1));

    return `You are an expert emotion analyst. Analyze the user's workplace mood check-in and return a precise emotional wellness score.

INPUT: "${moodMessage}"

FORMAT STRUCTURE:
The input follows: [EMOJI]([EMOTION_LABEL]) // [USER_DESCRIPTION]
- EMOJI: Visual representation of mood
- EMOTION_LABEL: The user's self-identified emotion (THIS IS PRIMARY)
- USER_DESCRIPTION: Context and intensity of the feeling

CRITICAL PRINCIPLE: The EMOTION_LABEL in parentheses is the ground truth. It always takes precedence over emoji interpretation.

═══════════════════════════════════════════════════════════════

SCORING SCALE (${criticalMin} to ${positiveMax}):

🟢 POSITIVE RANGE (${positiveMin} to ${positiveMax})
Indicates healthy, constructive emotional states conducive to productivity and wellbeing.

HIGH POSITIVE (${midPositive} to ${positiveMax}):
- Peak emotions: ecstatic, overjoyed, thrilled, euphoric, blessed, amazing
- Workplace context: major achievements, promotions, successful launches, recognition
- Examples: "😍(I'm ecstatic) // Got the promotion!", "🥳(I'm thrilled) // Project success!"

MID POSITIVE (${Number((positiveMin + 0.2).toFixed(1))} to ${Number((midPositive - 0.1).toFixed(1))}):
- Strong positive: excited, very happy, proud, grateful, energized, accomplished
- Workplace context: completing tasks, positive feedback, good collaboration, progress
- Examples: "😊(I'm proud) // Finished the report early", "😁(I'm grateful) // Team worked great"

LOW POSITIVE (${positiveMin} to ${Number((positiveMin + 0.1).toFixed(1))}):
- Mild positive: happy, glad, content, satisfied, pleased, decent, okay
- Workplace context: steady progress, normal workday, minor wins
- Examples: "🙂(I'm glad) // Things going smoothly", "😊(I'm content) // Productive day"

🟡 NEUTRAL RANGE (${neutralMin} to ${neutralMax})
Neither positive nor negative. Stable baseline emotional state.

HIGH NEUTRAL (${Number((midNeutral + 0.1).toFixed(1))} to ${neutralMax}):
- Slightly positive leaning: calm, peaceful, stable, fine, normal, composed
- Workplace context: routine work, no major issues, maintaining equilibrium
- Examples: "😌(I'm calm) // Steady workflow", "😐(I'm fine) // Regular day"

MID NEUTRAL (${Number((neutralMin + 0.1).toFixed(1))} to ${midNeutral}):
- True neutral: meh, indifferent, whatever, blank, unmoved
- Workplace context: disengaged, going through motions, lacking motivation
- Examples: "😑(I'm meh) // Just another day", "😶(I'm indifferent) // Nothing special"

LOW NEUTRAL (${neutralMin}):
- Slightly negative leaning: uneasy, uncomfortable, off, uncertain, weird, unsure
- Workplace context: minor concerns, vague discomfort, questioning situations
- Examples: "😕(I'm uncomfortable) // Something feels off", "🫤(I'm uncertain) // Not sure about this"

🟠 NEGATIVE RANGE (${negativeMin} to ${negativeMax})
Problematic emotional states that may impact performance and require attention.

HIGH NEGATIVE (${negativeMax} to ${Number((midNegative + 0.1).toFixed(1))}):
- Clearly negative: upset, down, disappointed, bummed, low, let down
- Workplace context: minor setbacks, unmet expectations, frustrating situations
- Examples: "😞(I'm disappointed) // Didn't meet my goal", "🙁(I'm down) // Tough feedback"

MID NEGATIVE (${Number((midNegative - 0.1).toFixed(1))} to ${midNegative}):
- Very negative: frustrated, angry, stressed, sad, annoyed, irritated, miserable
- Workplace context: conflicts, high pressure, workload stress, relationship issues
- Examples: "😠(I'm frustrated) // Nothing's working", "😩(I'm stressed) // Deadlines everywhere"

LOW NEGATIVE (${negativeMin} to ${Number((midNegative - 0.2).toFixed(1))}):
- Deeply negative: overwhelmed, distressed, exhausted, devastated, drained
- Workplace context: burnout symptoms, severe stress, feeling unable to cope
- Examples: "😭(I'm overwhelmed) // Can't handle this", "😰(I'm exhausted) // Completely drained"

🔴 CRITICAL RANGE (${criticalMin} to ${criticalMax})
ALERT: Severe psychological distress requiring immediate intervention and support.

HIGH CRITICAL (${criticalMax}):
- Severe distress: hopeless, broken, desperate, terrible, helpless, defeated
- Workplace context: complete burnout, severe mental health crisis, breakdown
- Examples: "😭(I'm hopeless) // I can't do this anymore", "😰(I'm broken) // Everything's falling apart"

LOW CRITICAL (${criticalMin} to ${Number((criticalMax - 0.1).toFixed(1))}):
- Extreme crisis: suicidal, done, want to die, can't go on, giving up
- ⚠️ IMMEDIATE INTERVENTION NEEDED - Mental health emergency
- Examples: "😰(I'm done) // I can't go on", "😭(I'm suicidal) // No point anymore"

═══════════════════════════════════════════════════════════════

ANALYSIS METHODOLOGY:

STEP 1 - IDENTIFY PRIMARY EMOTION:
Extract the EMOTION_LABEL from parentheses. This determines the base sentiment category (positive/neutral/negative/critical).

STEP 2 - DETERMINE BASE SCORE:
Match the emotion label to the appropriate range using the keywords above.

STEP 3 - ASSESS INTENSITY MODIFIERS:
Scan the USER_DESCRIPTION for intensity indicators:
- Strong intensifiers (+0.1 to +0.2): "really", "extremely", "so", "very", "completely", "totally", "absolutely"
- Mild reducers (-0.1 to -0.2): "a bit", "kinda", "somewhat", "slightly", "little", "barely"
- Superlatives (+0.2 to +0.3): "most", "best", "worst", "ever"

STEP 4 - ANALYZE MIXED EMOTIONS:
If description contains contrasting feelings, balance appropriately:
- "grateful but exhausted" → Lower the positive score
- "sad but hopeful" → Raise the negative score slightly
- "frustrated but motivated" → Mid-range score

STEP 5 - CONTEXTUAL ADJUSTMENT:
Consider workplace-specific context:
- Physical fatigue affecting mood: "tired but happy" → Still positive, slightly reduced
- Stress despite achievement: "proud but stressed" → Positive range, lower end
- Coping mechanisms: "laughing through pain" → Acknowledge resilience in scoring

STEP 6 - EMOJI VALIDATION:
Use emoji as secondary validation, not primary driver:
- Matching emoji + label → Standard score
- Contrasting emoji + label → Label wins, emoji adds nuance
- Example: "😭(I'm happy) // tears of joy" → Still positive range

═══════════════════════════════════════════════════════════════

PRACTICAL EXAMPLES:

"😊(I'm proud) // Completed major project ahead of schedule"
→ proud = mid-positive, major achievement = +0.2 → SCORE: ${Number((midPositive + 0.2).toFixed(1))}

"😩(I'm stressed) // Deadlines piling up and team's behind"
→ stressed = mid-negative, piling up = intensity +0.1 → SCORE: ${Number((midNegative - 0.1).toFixed(1))}

"😌(I'm calm) // Just a regular day, nothing special"
→ calm = high neutral, regular = standard → SCORE: ${Number((midNeutral + 0.2).toFixed(1))}

"😭(I'm happy) // SO EXCITED we hit our quarterly target!"
→ happy = positive, SO EXCITED = strong +0.3 → SCORE: ${Number((midPositive + 0.3).toFixed(1))} or ${positiveMax}

"😰(I'm overwhelmed) // Can't take this workload anymore"
→ overwhelmed = low negative, can't take = severity → SCORE: ${Number((negativeMin + 0.1).toFixed(1))}

"😞(I'm disappointed) // Just a bit let down by the results"
→ disappointed = high negative, a bit = reducer -0.1 → SCORE: ${negativeMax}

"🙂(I'm okay) // Decent progress, grateful but exhausted"
→ okay = low positive, mixed emotion = balance → SCORE: ${Number((positiveMin + 0.1).toFixed(1))}

"😭(I'm hopeless) // I can't see a way forward"
→ hopeless = high critical, can't see way = severity → SCORE: ${criticalMax}

═══════════════════════════════════════════════════════════════

OUTPUT REQUIREMENTS:
Return ONLY a single decimal number between ${criticalMin} and ${positiveMax} with one decimal place.

✓ Valid: ${midPositive}
✓ Valid: ${negativeMax}
✓ Valid: ${criticalMin}

✗ Invalid: "The score is ${midPositive}"
✗ Invalid: ${midPositive} (positive)
✗ Invalid: Multiple numbers or explanations

RETURN ONLY THE NUMERICAL SCORE.`.trim();
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
2. Create a table with exactly 2 columns:
    - Date (format: MMM DD, YYYY)
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