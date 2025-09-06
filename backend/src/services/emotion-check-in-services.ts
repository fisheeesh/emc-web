import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";
import { PrismaClient } from "../../generated/prisma";
import { MOOD_THRESHOLDS } from "../config";
import { getThaiDayBounds } from "../utils/helplers";

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

export const getSentimentsComparisonData = async (departmentId: number, start: Date, end: Date) => {
    try {
        //* Get all check-ins based on date-range in emp's depart
        const checkIns = await prisma.emotionCheckIn.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                },
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

        const days = eachDayOfInterval({ start, end })

        const result = days.map(day => {
            const key = format(day, "yyyy-MM-dd")
            return {
                checkInDate: key,
                positive: dayMap[key]?.positive ?? 0,
                neutral: dayMap[key]?.neutral ?? 0,
                negative: dayMap[key]?.negative ?? 0,
                critical: dayMap[key]?.critical ?? 0
            }
        })

        return result
    } catch (error) {
        return error
    }
}

interface DailyAttendanceData {
    totalEmp: number,
    totalPresent: number,
    result: any,
    percentages: any
}

export const getDailyAttendanceData = async (departmentId: number, start: Date, end: Date): Promise<DailyAttendanceData> => {
    try {
        const totalEmp = await prisma.employee.count({
            where: { departmentId }
        })

        const { startUtc, endUtc } = getThaiDayBounds();
        const totalPresent = await prisma.emotionCheckIn.count({
            where: {
                createdAt: {
                    gte: startUtc,
                    lte: endUtc
                }
            }
        })

        const checkIns = await prisma.emotionCheckIn.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                },
                employee: {
                    departmentId
                }
            },
            select: {
                createdAt: true
            }
        })

        const dayMap: Record<
            string, { value: number }
        > = {}

        for (const entry of checkIns) {
            const checkInDate = format(entry.createdAt, "yyyy-MM-dd");
            if (!dayMap[checkInDate]) dayMap[checkInDate] = { value: 1 }
            else dayMap[checkInDate].value++
        }

        const days = eachDayOfInterval({ start, end })

        const result = days.map(day => {
            const key = format(day, "yyyy-MM-dd")
            return {
                checkInDate: key,
                value: dayMap[key]?.value ?? 0
            }
        })

        const percentages = result.map(data => {
            return {
                ...data,
                value: +((data.value / Math.max(totalEmp, 1) * 100)).toFixed(2)
            }
        })

        return {
            totalEmp,
            totalPresent,
            result,
            percentages
        }
    } catch (error) {
        return {
            totalEmp: 0,
            totalPresent: 0,
            result: [],
            percentages: []
        }
    }
}