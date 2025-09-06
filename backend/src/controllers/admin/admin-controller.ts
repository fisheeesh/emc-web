import { endOfDay, startOfDay, startOfMonth, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { query } from "express-validator";
import { PrismaClient } from "../../../generated/prisma";
import { prisma } from "../../config/prisma-client";
import { getEmployeeById } from "../../services/auth-services";
import { getDailyAttendanceData, getSentimentsComparisonData, getTodayMoodPercentages } from "../../services/emotion-check-in-services";
import { checkEmployeeIfNotExits } from "../../utils/check";
import { getThaiDayBounds, roundToHour } from "../../utils/helplers";

interface CustomRequest extends Request {
    employeeId?: number
}

const prismaClient = new PrismaClient()

export const testAdmin = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "You have permission to access this route"
    })
}

export const getTodayMoodOverview = [
    query("duration", "Invalid Duration")
        .trim()
        .escape()
        .optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { duration = 'today' } = req.query

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const now = new Date()

        const durationFilter = duration === 'today'
            ? {
                gte: startOfDay(now),
                lte: endOfDay(now)
            } : {
                gte: startOfMonth(now),
                lte: endOfDay(now)
            }

        const percentages = await getTodayMoodPercentages(emp!.departmentId, durationFilter)
        // const cacheKey = `emotion-mood-overview-${JSON.stringify(durationFilter)}`
        // const percentages = await getOrSetCache(cacheKey, async () => getTodayMoodPercentages(emp!.departmentId, durationFilter))

        res.status(200).json({
            message: "Here is Today Mood Overview Data.",
            data: percentages
        })
    }
]

export const getSenitmentsComparison = [
    query("duration", "Invalid Duration")
        .trim()
        .escape()
        .optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId;
        const { duration = "7" } = req.query;

        const emp = await getEmployeeById(empId!);
        checkEmployeeIfNotExits(emp);

        const now = new Date();

        const start = startOfDay(subDays(now, duration === '7' ? 6 : 29))
        const end = endOfDay(now)

        const result = await getSentimentsComparisonData(emp!.departmentId, start, end);
        // const cacheKey = `emotion-comparison-${JSON.stringify(durationFilter)}`
        // const result = await getOrSetCache(cacheKey, async () => getSentimentsComparisonData(durationFilter, emp!.departmentId))

        return res.status(200).json({
            message: "Here is Sentiments Comparison Data.",
            data: result,
        });
    }
]

export const getDailyAttendance = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const start = startOfDay(subDays(new Date(), 9))
    const end = endOfDay(new Date())

    const { totalEmp, totalPresent, result, percentages } = await getDailyAttendanceData(emp!.departmentId, start, end)

    res.status(200).json({
        message: "Here is daily attendance.",
        totalEmp,
        totalPresent,
        data: result,
        percentages
    })
}

export const getCheckInHours = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const { startUtc, endUtc } = getThaiDayBounds();

    const checkIns = await prismaClient.emotionCheckIn.findMany({
        where: {
            createdAt: {
                gte: startUtc,
                lte: endUtc,
            },
            employee: { departmentId: emp!.departmentId }
        },
        select: {
            createdAt: true
        }
    })

    const hoursOrder: string[] = Array.from({ length: 24 }, (_, i) => {
        return `${String(i).padStart(2, '0')}:00`
    })
    const counts = new Map(hoursOrder.map(h => [h, 0]))

    for (const { createdAt } of checkIns) {
        const bucket = roundToHour(createdAt)
        counts.set(bucket, (counts.get(bucket) || 0) + 1)
    }

    const data = hoursOrder.map(checkInHour => ({
        checkInHour,
        value: counts.get(checkInHour) || 0
    }))

    res.status(200).json({
        message: "Here is check in hours.",
        data
    })
}

export const getAttendanceOverView = [
    query("empName", "Invalid Name.")
        .trim()
        .optional()
        .escape(),
    query("status", "Invalid Status")
        .trim()
        .optional()
        .escape(),
    query("date", "Invalid Date")
        .trim()
        .optional()
        .escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { empName, status, date } = req.query

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { startUtc, endUtc } = getThaiDayBounds();

        const result = await prisma.emotionCheckIn.findMany({
            where: {
                createdAt: {
                    gte: startUtc,
                    lte: endUtc
                },
                employee: {
                    firstName: {
                        contains: typeof empName === 'string' ? empName : '',
                        mode: 'insensitive'
                    },
                    departmentId: emp!.departmentId,
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

        res.status(200).json({
            message: "Here is Attendance OverView Data.",
            data: filtered
        })
    }
]
