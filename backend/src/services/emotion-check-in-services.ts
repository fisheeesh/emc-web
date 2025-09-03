import { format } from "date-fns";
import { PrismaClient } from "../../generated/prisma";
import { MOOD_THRESHOLDS } from "../config";

const prisma = new PrismaClient()

export const createEmotionCheckIn = async (emotion: any) => {
    const data = {
        emoji: emotion.emoji,
        textFeeling: emotion.textFeeling,
        emotionScore: emotion.emotionScore,
        employee: {
            connect: { id: emotion.employeeId }
        }
    }

    return await prisma.emotionCheckIn.create({
        data
    })
}

export const getTodayMoodPercentages = async (departmentId: number, durationFilter: any) => {
    try {
        //* Get all check-ins for employees in the same dep
        const todayCheckIns = await prisma.emotionCheckIn.groupBy({
            by: ['employeeId'],
            where: {
                createdAt: durationFilter,
                employee: { departmentId }
            },
            _avg: {
                emotionScore: true
            }
        })

        //* Count total employees in the department
        const totalEmp = await prisma.employee.count({
            where: { departmentId }
        })

        let posi = 0, neu = 0, nega = 0, crit = 0;

        for (const row of todayCheckIns) {
            const score = Number(row._avg.emotionScore) ?? 0

            if (score >= MOOD_THRESHOLDS.positive) posi++
            else if (score >= MOOD_THRESHOLDS.neutralMin) neu++
            else if (score >= MOOD_THRESHOLDS.negativeMin) nega++
            else crit++
        }

        const denom = Math.max(totalEmp, 1)

        //*  Make sure the final result is an array of numbers instead of strings. Since .toFixed() returns a string
        const percentages = [
            ((posi / denom) * 100).toFixed(2),
            ((neu / denom) * 100).toFixed(2),
            ((nega / denom) * 100).toFixed(2),
            ((crit / denom) * 100).toFixed(2),
        ].map(Number)

        return percentages
    } catch (error) {
        return error
    }
}

export const getSentimentsComparisonData = async (durationFilter: any, departmentId: number) => {
    try {
        //* Get all check-ins based on date-range in emp's depart
        const checkIns = await prisma.emotionCheckIn.findMany({
            where: {
                createdAt: durationFilter,
                employee: { departmentId }
            },
            select: {
                emotionScore: true,
                createdAt: true
            }
        })

        //* Set sample output
        const dayMap: Record<
            string,
            { positive: number, neutral: number, negative: number, critical: number }
        > = {}

        for (const entry of checkIns) {
            const checkInDate = format(entry.createdAt, "yyyy-MM-dd");

            //* Store them by checkInDate
            if (!dayMap[checkInDate]) {
                dayMap[checkInDate] = {
                    positive: 0,
                    neutral: 0,
                    negative: 0,
                    critical: 0
                }
            }

            const score = Number(entry.emotionScore)

            //* Increase count based on entry's emotionScore
            if (score >= MOOD_THRESHOLDS.positive) dayMap[checkInDate].positive++
            else if (score >= MOOD_THRESHOLDS.neutralMin) dayMap[checkInDate].neutral++
            else if (score >= MOOD_THRESHOLDS.negativeMin) dayMap[checkInDate].negative++
            else dayMap[checkInDate].critical++
        }

        //* Format the desired output based on date ascending
        const result = Object.entries(dayMap)
            .sort(([d1], [d2]) => new Date(d1).getTime() - new Date(d2).getTime())
            .map(([checkInDate, counts]) => ({
                checkInDate,
                ...counts
            }))

        return result
    } catch (error) {
        return error
    }
}