import { Worker } from "bullmq";
import { redis } from "../../config/redis-client";
import { groq } from '@ai-sdk/groq'
import { generateText } from 'ai'

import dotenv from "dotenv";
dotenv.config();

const scoreWorker = new Worker("scoreQueue", async (job) => {
    const { moodMessage } = job.data

    const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: `
            The user has submitted a mood check-in: "${moodMessage}"

            This message may contain:
            - An emoji (e.g., 😊, 😢, 😐, 🙂, 😤, 😔)
            - A brief text description (e.g., "Just a normal day", "Feeling great!", "Not doing well")
            - Or both combined (e.g., "🙂 Just a normal day", "😔 Feeling really down")

            Analyze BOTH the emoji and text together to determine the user's emotional state.

            Scoring Guidelines:
            
            **Positive Range (0.1 to 1.0):**
            - 0.9 to 1.0: Extremely happy, euphoric, best day ever (😍, 🥳, "I'm so happy I could cry!")
            - 0.7 to 0.8: Very happy, excited, great mood (😊, 😄, "Feeling amazing today!")
            - 0.5 to 0.6: Happy, content, good vibes (🙂, 😌, "Things are going well")
            - 0.3 to 0.4: Slightly positive, mild contentment (🙂, "It's okay", "Decent day")
            - 0.1 to 0.2: Barely positive, neutral-leaning-good (🙂, "Just a normal day", "Nothing special")

            **Neutral Range (-0.2 to 0.2):**
            - -0.2 to 0.2: Truly neutral, indifferent, "meh" (😐, 😶, "Just existing", "Whatever")

            **Negative Range (-1.0 to -0.1):**
            - -0.1 to -0.2: Slightly off, minor discomfort (🙁, "Not my best day")
            - -0.3 to -0.4: Somewhat negative, frustrated, tired (😕, 😞, "Feeling drained")
            - -0.5 to -0.6: Clearly negative, angry, sad, stressed (😠, 😤, 😔, "Really frustrated", "Feeling angry")
            - -0.7 to -0.8: Very negative, deeply sad, depressed (😭, 😢, "I feel awful", "Everything hurts")
            - -0.9 to -1.0: Extremely negative, hopeless, suicidal thoughts (💔, "I can't do this anymore", "I want to give up")

            **Special Considerations:**
            - "Just a normal day" with 🙂 = around 0.1 to 0.2 (neutral-to-slightly-positive)
            - If emoji contradicts text, weight the emoji slightly more (emojis often reveal true feelings)
            - Anger/frustration should range from -0.5 to -0.7 depending on intensity
            - Sarcasm or irony should be detected when possible (e.g., "Great day 🙄" is negative)

            Output ONLY a single number between -1 and 1 (e.g., 0.15, -0.6, 0.8).
            No explanations, no words, just the number.
        `,
        system: "You are an expert emotional intelligence therapist trained in emoji interpretation, modern communication styles, and multilingual sentiment analysis (English, Burmese, Thai). You provide precise, nuanced mood scores based on subtle emotional cues."
    })

    console.log('Mood Score:', text)

    return text
}, { connection: redis })

scoreWorker.on("completed", (job) => {
    console.log(`Job: ${job.id} completed`)
})

scoreWorker.on("failed", (job: any, err) => {
    console.log(`Job: ${job.id} failed`, err)
})