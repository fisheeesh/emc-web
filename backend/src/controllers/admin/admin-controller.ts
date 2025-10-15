import { endOfDay, endOfMonth, endOfYear, startOfDay, startOfMonth, startOfYear, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { query } from "express-validator";
import { prisma } from "../../config/prisma-client";
import { getAdminUserData } from "../../services/admin-services";
import { getEmployeeById } from "../../services/auth-services";
import { getAttendanceOverviewInfiniteData, getCheckInHoursData, getDailyAttendanceData, getMoodPercentages, getSentimentsComparisonData } from "../../services/emotion-check-in-services";
import { getAllDepartmentsData } from "../../services/system-service";
import { checkEmployeeIfNotExits } from "../../utils/check";
import { getEmotionRange } from "../../utils/helplers";
import { Prisma, PrismaClient } from "../../../generated/prisma";

interface CustomRequest extends Request {
    employeeId?: number
}

const prismaClient = new PrismaClient()

export const testAdmin = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "You have permission to access this route"
    })
}

export const getMoodOverview = [
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("duration", "Invalid Duration").trim().escape().optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { duration = '1', dep } = req.query

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const now = new Date()
        const start = startOfDay(subDays(now, +duration - 1))
        const end = endOfDay(now)

        const durationFilter = {
            gte: start,
            lte: end
        }

        const percentages = await getMoodPercentages(emp!.departmentId, dep as string, emp!.role, durationFilter)
        // const cacheKey = `emotion-mood-overview-${JSON.stringify(durationFilter)}`
        // const percentages = await getOrSetCache(cacheKey, async () => getTodayMoodPercentages(emp!.departmentId, durationFilter))

        res.status(200).json({
            message: "Here is Today Mood Overview Data.",
            data: percentages
        })
    }
]

export const getSenitmentsComparison = [
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("duration", "Invalid Duration").trim().escape().optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId;
        const { duration = "7", dep } = req.query;

        const emp = await getEmployeeById(empId!);
        checkEmployeeIfNotExits(emp);

        const now = new Date();

        const start = startOfDay(subDays(now, +duration - 1))
        const end = endOfDay(now)

        const result = await getSentimentsComparisonData(emp!.departmentId, dep as string, emp!.role, start, end);
        // const cacheKey = `emotion-comparison-${JSON.stringify(durationFilter)}`
        // const result = await getOrSetCache(cacheKey, async () => getSentimentsComparisonData(durationFilter, emp!.departmentId))

        return res.status(200).json({
            message: "Here is Sentiments Comparison Data.",
            data: result,
        });
    }
]

export const getDailyAttendance = [
    query("dep", "Invalid Department.").trim().escape().optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { dep } = req.query

        const start = startOfDay(subDays(new Date(), 9))
        const end = endOfDay(new Date())

        const { totalEmp, totalPresent, result, percentages } = await getDailyAttendanceData(emp!.departmentId, dep as string, emp!.role, start, end)

        res.status(200).json({
            message: "Here is daily attendance.",
            totalEmp,
            totalPresent,
            data: result,
            percentages
        })
    }
]

export const getCheckInHours = [
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("duration", "Invalid Date.").trim().optional().escape(),
    query("type", "Invalid Type.").trim().optional().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { duration, type, dep } = req.query
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const durationFilter =
            type === 'day' ? {
                gte: startOfDay(new Date(duration as string)),
                lte: endOfDay(new Date(duration as string))
            } : type === 'month' ? {
                gte: startOfMonth(new Date(duration as string)),
                lte: endOfMonth(new Date(duration as string))
            } : type === 'year' ? {
                gte: startOfYear(new Date(duration as string)),
                lte: endOfYear(new Date(duration as string))
            } : {
                gte: startOfDay(new Date()),
                lte: endOfDay(new Date())
            }

        const data = await getCheckInHoursData(emp!.departmentId, dep as string, emp!.role, durationFilter)

        res.status(200).json({
            message: "Here is check in hours.",
            data
        })
    }
]

export const getAttendanceOverView = [
    query("limit", "Limit must be LogId.").isInt({ gt: 6 }).optional(),
    query("cursor", "Cursor must be unsigned integer.").isInt({ gt: 0 }).optional(),
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("kw", "Invalid Keyword.").trim().optional().escape(),
    query("status", "Invalid Status").trim().optional().escape(),
    query("date", "Invalid Date").trim().optional().escape(),
    query("ts", "Invalid Timestamp").trim().optional().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { limit = 7, cursor: lastCursor, kw, status, date, dep, ts = 'desc' } = req.query

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const start = startOfDay(date ? new Date(date as string) : new Date());
        const end = endOfDay(date ? new Date(date as string) : new Date());

        const where: any = {
            createdAt: { gte: start, lte: end },
        };

        const employeeWhere: any = {};

        const deptId =
            emp!.role !== "SUPERADMIN"
                ? emp!.departmentId
                : dep && dep !== "all"
                    ? Number(dep)
                    : undefined;

        if (typeof deptId !== "undefined") {
            employeeWhere.departmentId = deptId;
        }

        const kwTrimmed = (kw || "").toString().trim();
        if (kwTrimmed.length > 0) {
            employeeWhere.OR = [
                { firstName: { contains: kwTrimmed, mode: "insensitive" } },
                { lastName: { contains: kwTrimmed, mode: "insensitive" } },
                { position: { contains: kwTrimmed, mode: "insensitive" } },
            ];
        }

        if (Object.keys(employeeWhere).length > 0) {
            where.employee = Object.keys(employeeWhere).length === 1 && "departmentId" in employeeWhere
                ? employeeWhere
                : { AND: [employeeWhere] };
        }

        const options: any = {
            take: +limit + 1,
            skip: lastCursor ? 1 : 0,
            cursor: lastCursor ? { id: +lastCursor } : undefined,
            where,
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
                updatedAt: ts
            }
        }

        if (typeof status === 'string' && status !== 'all') {
            const emotionRange = getEmotionRange(status.toLowerCase());
            if (emotionRange) {
                options.where.emotionScore = emotionRange;
            }
        }

        const attendances = await getAttendanceOverviewInfiniteData(options)
        const hasNextPage = attendances!.length > +limit

        if (hasNextPage) attendances!.pop()

        const nextCursor = hasNextPage ? attendances![attendances!.length - 1].id : null

        res.status(200).json({
            message: "Here is Attendance OverView Data.",
            hasNextPage,
            nextCursor,
            prevCursor: lastCursor || undefined,
            data: attendances
        })
    }
]

export const getAllDepartments = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const result = await getAllDepartmentsData()

    res.status(200).json({
        message: "Here is All Departments Data.",
        data: result
    })
}

export const getAdminUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const result = await getAdminUserData(emp!.id)

    res.status(200).json({
        message: "Here is Admin User Data.",
        data: result
    })
}

export const getLeaderboards = [
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("kw", "Invalid Keyword.").trim().optional().escape(),
    query("duration", "Invalid Date.").trim().optional().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { dep, kw, duration = '7' } = req.query
        const empId = req.employeeId

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const kwFilter: Prisma.EmployeeWhereInput = kw ? {
            OR: [
                { firstName: { contains: kw as string, mode: 'insensitive' } },
                { lastName: { contains: kw as string, mode: 'insensitive' } }
            ] as Prisma.EmployeeWhereInput[]
        } : {}

        const now = new Date()
        const start = startOfDay(subDays(now, +duration - 1))
        const end = endOfDay(now)

        const durationFilter = {
            gte: start,
            lte: end
        }

        const results = await prisma.employee.findMany({
            where: {
                departmentId:
                    emp!.role !== 'SUPERADMIN'
                        ? emp!.departmentId
                        : dep && dep !== 'all'
                            ? Number(dep)
                            : undefined,
                ...kwFilter
            },
            select: {
                fullName: true,
                email: true,
                points: true,
                avatar: true,
                department: true,
                streak: true,
            },
            orderBy: [
                { points: 'desc' },
                { streak: 'desc' },
                { firstName: 'asc' }
            ],
            take: 7
        })

        //* Add ranking with tie handling
        let currentRank = 1
        let previousPoints: any = null
        let employeesWithSameRank = 0

        const rankedResults = results.map((employee) => {
            if (previousPoints !== null && employee.points < previousPoints) {
                //* Points changed, update rank
                currentRank += employeesWithSameRank
                employeesWithSameRank = 1
            } else if (previousPoints === employee.points) {
                //* Same points, increment counter
                employeesWithSameRank++
            } else {
                //* First employee
                employeesWithSameRank = 1
            }

            previousPoints = employee.points

            return {
                ...employee,
                rank: currentRank
            }
        })

        res.status(200).json({
            message: "Here is Leaderboards data.",
            data: rankedResults
        })
    }
]
