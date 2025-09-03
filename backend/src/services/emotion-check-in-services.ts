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
}