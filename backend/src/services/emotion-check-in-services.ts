import { eachDayOfInterval, endOfDay, format, startOfDay } from "date-fns";
import { PrismaClient } from "../../generated/prisma";
import { MOOD_THRESHOLDS } from "../config";
import { getThaiDayBounds, roundToHour } from "../utils/helplers";
import { prisma } from "../config/prisma-client";

const prismaClient = new PrismaClient()

export const createEmotionCheckIn = async (emotion: any) => {
    const data = {
        emoji: emotion.emoji,
        textFeeling: emotion.textFeeling,
        emotionScore: emotion.emotionScore,
        employee: {
            connect: { id: emotion.employeeId }
        }
    }

    return await prismaClient.emotionCheckIn.create({
        data
    })
}

export const getTodayMoodPercentages = async (departmentId: number, durationFilter: any) => {
    try {
        //* Get all check-ins for employees in the same dep
        const todayCheckIns = await prismaClient.emotionCheckIn.groupBy({
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
        const totalEmp = await prismaClient.employee.count({
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
        const checkIns = await prismaClient.emotionCheckIn.findMany({
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
            const checkInDate = format(entry.createdAt, "MMM dd");

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

        //* Also set values to interval days to avoid jump data in the chart
        const days = eachDayOfInterval({ start, end })

        const result = days.map(day => {
            const key = format(day, "MMM dd")
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
        //* Get all emp from the department
        const totalEmp = await prismaClient.employee.count({
            where: { departmentId }
        })

        const { startUtc, endUtc } = getThaiDayBounds();

        //* Get all check-in emps in the department
        const totalPresent = await prismaClient.emotionCheckIn.count({
            where: {
                createdAt: {
                    gte: startOfDay(new Date()),
                    lte: endOfDay(new Date())
                },
                employee: {
                    departmentId
                }
            }
        })

        //* Get all check-ins made by today
        const checkIns = await prismaClient.emotionCheckIn.findMany({
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

        //* Set sample output
        const dayMap: Record<
            string, { value: number }
        > = {}

        for (const entry of checkIns) {
            //* Format date
            const checkInDate = format(entry.createdAt, "MMM dd");
            //* Check if there is, plus 1, if not set to 1
            if (!dayMap[checkInDate]) dayMap[checkInDate] = { value: 1 }
            else dayMap[checkInDate].value++
        }

        //? We also want to show the interval days in the chart to avoid jumping data
        const days = eachDayOfInterval({ start, end })

        //* Loop through each day between start and end and set data. If there is no data, set to 0
        const result = days.map(day => {
            const key = format(day, "MMM dd")
            return {
                checkInDate: key,
                value: dayMap[key]?.value ?? 0
            }
        })

        //* Calculate percentages
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

export const getCheckInHoursData = async (departmentId: number) => {
    try {
        //* Get all check-in made by today
        const checkIns = await prismaClient.emotionCheckIn.findMany({
            where: {
                createdAt: {
                    gte: startOfDay(new Date()),
                    lte: endOfDay(new Date())
                },
                employee: { departmentId }
            },
            select: {
                createdAt: true
            }
        })

        //* Set sample hours data from 00:00 to 23:00
        const hourOrders = Array.from({ length: 24 }, (_, i) => {
            return `${String(i).padStart(2, '0')}:00`
        })
        //* Format data for easier manipulation
        const counts = new Map(hourOrders.map(h => [h, 0]))

        for (const { createdAt } of checkIns) {
            //* Round to nearest hour
            const bucket = roundToHour(createdAt)
            counts.set(bucket, (counts.get(bucket) || 0) + 1)
        }

        //* Customize desired result
        const result = hourOrders.map(checkInHour => ({
            checkInHour,
            value: counts.get(checkInHour)
        }))

        return result

    } catch (error) {
        console.log(error)
    }
}

export const getAttendanceOverviewData = async (departmentId: number, empName: string, status: string) => {
    try {
        const result = await prisma.emotionCheckIn.findMany({
            where: {
                createdAt: {
                    gte: startOfDay(new Date()),
                    lte: endOfDay(new Date())
                },
                employee: {
                    firstName: {
                        contains: typeof empName === 'string' ? empName : '',
                        mode: 'insensitive'
                    },
                    departmentId,
                }
            },
            select: {
                id: true,
                emoji: true,
                textFeeling: true,
                emotionScore: true,
                status: true,
                checkInTime: true,
                employee: {
                    select: {
                        id: true,
                        fullName: true,
                        position: true,
                        jobType: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })


        const filtered = typeof status === 'string' && status !== 'all'
            ? result.filter(r => r.status.toLowerCase().includes(status.toLowerCase()))
            : result

        return filtered
    } catch (error) {
        console.log(error)
    }
}