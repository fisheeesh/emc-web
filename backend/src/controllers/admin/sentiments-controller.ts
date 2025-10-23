import { endOfDay, startOfDay, startOfMonth, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import { Prisma, PrismaClient } from "../../../generated/prisma";
import { errorCodes } from "../../config/error-codes";
import { prisma } from "../../config/prisma-client";
import { getEmployeeById } from "../../services/auth-services";
import { getAllCriticalInfinite, getAllWatchlistInfinite } from "../../services/critical-services";
import { getMoodPercentages, getSentimentsComparisonData } from "../../services/emotion-check-in-services";
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check";

interface CustomRequest extends Request {
    employeeId?: number
}

const prismaClient = new PrismaClient()

export const getMoodOverview = [
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("duration", "Invalid Duration").trim().escape().optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { duration = '1', dep } = req.query

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const now = new Date()
        let start: Date
        const end = endOfDay(now)

        if (+duration === 30) {
            start = startOfMonth(now)
        } else {
            start = startOfDay(subDays(now, +duration - 1))
        }

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

export const getLeaderboards = [
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("kw", "Invalid Keyword.").trim().optional().escape(),
    query("duration", "Invalid Date.").trim().optional().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { dep, kw, duration = '30' } = req.query
        const empId = req.employeeId

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const kwFilter: Prisma.EmployeeWhereInput = kw ? {
            OR: [
                { firstName: { contains: kw as string, mode: 'insensitive' } },
                { lastName: { contains: kw as string, mode: 'insensitive' } }
            ] as Prisma.EmployeeWhereInput[]
        } : {}

        const isAllTime = duration === 'all'

        //* Fetch employees with conditional check-ins query
        const employees = await prisma.employee.findMany({
            where: {
                department: {
                    isActive: true,
                },
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
                avatar: true,
                firstName: true,
                streak: true,
                points: true,
                department: true,
                checkIns: isAllTime ? false : {
                    where: {
                        createdAt: {
                            gte: startOfDay(subDays(new Date(), +duration - 1)),
                            lte: endOfDay(new Date())
                        }
                    },
                    select: {
                        points: true
                    }
                }
            }
        })

        //* Calculate points based on filter type
        const results = employees.map(employee => {
            const periodPoints = isAllTime
                ? employee.points
                : employee.checkIns.reduce((sum, checkIn) => {
                    return sum + (checkIn.points ? Number(checkIn.points) : 0)
                }, 0)

            return {
                fullName: employee.fullName,
                email: employee.email,
                avatar: employee.avatar,
                department: employee.department,
                streak: employee.streak,
                points: periodPoints,
                firstName: employee.firstName
            }
        })

        //* Sort by points (desc), streak (desc), firstName (asc)
        results.sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points
            }
            if (b.streak !== a.streak) {
                return (b.streak || 0) - (a.streak || 0)
            }
            return (a.firstName || '').localeCompare(b.firstName || '')
        })

        //* Take top 7
        const top7 = results.slice(0, 7)

        //* Add ranking with tie handling
        let currentRank = 1
        let previousPoints: number | null = null
        let employeesWithSameRank = 0

        const rankedResults = top7.map((employee) => {
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

            //* Remove firstName from final result
            const { firstName, ...employeeData } = employee

            return {
                ...employeeData,
                rank: currentRank
            }
        })

        res.status(200).json({
            message: "Here is Leaderboards data.",
            data: rankedResults
        })
    }
]

export const getAllCriticalEmps = [
    query("limit", "Limit must be LogId.").isInt({ gt: 6 }).optional(),
    query("cursor", "Cursor must be unsigned integer.").isInt({ gt: 0 }).optional(),
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("kw", "Invalid Keyword.").trim().optional().escape(),
    query("ts", "Invalid Timestamp").trim().optional().escape(),
    query("status", "Invalid Status").trim().optional().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)

        checkEmployeeIfNotExits(emp)

        const { limit = 7, cursor: lastCursor, dep, kw, ts = 'desc', status } = req.query

        const statusFilter: Prisma.CriticalEmployeeWhereInput = status && status !== 'all' ? {
            isResolved: status === 'RESOLVED' ? true : false
        } : {}

        const options = {
            take: +limit + 1,
            skip: lastCursor ? 1 : 0,
            cursor: lastCursor ? { id: +lastCursor } : undefined,
            where: {
                ...statusFilter,
                ...(kw && {
                    employee: {
                        OR: [
                            { firstName: { contains: kw as string, mode: 'insensitive' } },
                            { lastName: { contains: kw as string, mode: 'insensitive' } }
                        ]
                    }
                }),
                department: {
                    isActive: true
                },
                departmentId:
                    emp!.role !== 'SUPERADMIN'
                        ? emp!.departmentId
                        : dep && dep !== 'all'
                            ? Number(dep)
                            : undefined,
            },
            select: {
                id: true,
                emotionScore: true,
                isResolved: true,
                resolvedAt: true,
                createdAt: true,
                department: true,
                employee: {
                    select: { fullName: true, avatar: true, email: true, lastCritical: true }
                },
                analysis: {
                    omit: {
                        updatedAt: true
                    }
                },
                actionPlan: true,
            },
            orderBy: {
                createdAt: ts
            }
        }

        const criticalEmps = await getAllCriticalInfinite(options)

        const hasNextPage = criticalEmps!.length > +limit
        if (hasNextPage) criticalEmps.pop()

        const nextCursor = hasNextPage ? criticalEmps[criticalEmps.length - 1].id : null

        res.status(200).json({
            message: "Here is all critical employees data",
            hasNextPage,
            nextCursor,
            prevCursor: lastCursor || undefined,
            data: criticalEmps
        })
    }
]

export const deleteCriticalEmpById = [
    body("id", "Critical Employee Id is required").isInt({ gt: 0 }),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0)
            next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { id } = req.body

        const cEmp = await prisma.criticalEmployee.findUnique({
            where: { id },
            select: {
                employee: {
                    select: {
                        departmentId: true
                    }
                }
            }
        })

        if (!cEmp) return next(createHttpErrors({
            message: "Critical employee record not found.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (emp?.departmentId !== cEmp.employee.departmentId) return next(createHttpErrors({
            message: "You are not allowed to delete critical employee's information from other department.",
            status: 403,
            code: errorCodes.forbidden
        }))

        const deletedCEmp = await prisma.criticalEmployee.delete({
            where: { id }
        })

        res.status(200).json({
            message: "Successfully deleted Critical Employee's Information",
            cEmpId: deletedCEmp.id
        })
    }
]

export const getAllWatchlistEmps = [
    query("limit", "Limit must be LogId.").isInt({ gt: 6 }).optional(),
    query("cursor", "Cursor must be unsigned integer.").isInt({ gt: 0 }).optional(),
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("kw", "Invalid Keyword.").trim().optional().escape(),
    query("ts", "Invalid Timestamp").trim().optional().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)

        checkEmployeeIfNotExits(emp)

        const { limit = 7, cursor: lastCursor, dep, kw, ts = 'desc' } = req.query

        const kwFilter: Prisma.EmployeeWhereInput = kw ? {
            OR: [
                { firstName: { contains: kw as string, mode: "insensitive" } },
                { lastName: { contains: kw as string, mode: 'insensitive' } }
            ]
        } : {}

        const options = {
            take: +limit + 1,
            skip: lastCursor ? 1 : 0,
            cursor: lastCursor ? { id: +lastCursor } : undefined,
            where: {
                ...kwFilter,
                status: 'WATCHLIST',
                department: {
                    isActive: true
                },
                departmentId:
                    emp!.role !== 'SUPERADMIN'
                        ? emp!.departmentId
                        : dep && dep !== 'all'
                            ? Number(dep)
                            : undefined,
            },
            select: {
                id: true,
                fullName: true,
                avatar: true,
                email: true,
                department: true,
                avgScore: true,
                lastCritical: true,
                checkIns: {
                    select: {
                        createdAt: true,
                        status: true,
                        emotionScore: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                criticalTimes: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    select: {
                        actionPlan: true
                    }
                }
            },
            orderBy: {
                createdAt: ts
            }
        }

        const watchlistEmps = await getAllWatchlistInfinite(options)

        //* Transform the data to flatten the actionPlan and include emotionData
        const transformedEmps = watchlistEmps.map(emp => ({
            id: emp.id,
            fullName: emp.fullName,
            avatar: emp.avatar,
            email: emp.email,
            department: emp.department,
            avgScore: emp.avgScore,
            lastCritical: emp.lastCritical,
            actionPlan: emp.criticalTimes?.[0]?.actionPlan || null,
            emotionHistory: emp.emotionHistory || []
        }))

        const hasNextPage = transformedEmps.length > +limit
        if (hasNextPage) transformedEmps.pop()

        const nextCursor = hasNextPage ? transformedEmps[transformedEmps.length - 1].id : null

        res.status(200).json({
            message: "Here is all watchlist employees data",
            hasNextPage,
            nextCursor,
            prevCursor: lastCursor || undefined,
            data: transformedEmps
        })
    }
]

export const deleteWatchlistEmpById = [
    body("id", "Watchlist Employee Id is required").isInt({ gt: 0 }),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0)
            next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { id } = req.body

        const wEmp = await prismaClient.employee.findUnique({
            where: { id },
            select: {
                departmentId: true,
                status: true
            }
        })

        if (!wEmp || wEmp.status !== 'WATCHLIST') return next(createHttpErrors({
            message: "Watchlist employee record not found.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (emp?.departmentId !== wEmp.departmentId) return next(createHttpErrors({
            message: "You are not allowed to delete watchlist employee's information from other department.",
            status: 403,
            code: errorCodes.forbidden
        }))

        const updatedEmp = await prisma.employee.update({
            where: { id },
            data: { status: 'NORMAL' }
        })

        res.status(200).json({
            message: "Successfully deleted Watchlist Employee's Information",
            empId: updatedEmp.id
        })
    }
]