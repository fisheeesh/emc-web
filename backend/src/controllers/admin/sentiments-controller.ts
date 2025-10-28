import { endOfDay, startOfDay, startOfMonth, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import { NotifType, Prisma, PrismaClient, RType, Status } from "../../../prisma/generated/prisma";
import { errorCodes } from "../../config/error-codes";
import { prisma } from "../../config/prisma-client";
import { EmailQueue } from "../../jobs/queues/email-queue";
import { getEmployeeById } from "../../services/auth-services";
import { getAllCriticalInfinite, getAllWatchlistInfinite } from "../../services/critical-services";
import { getMoodPercentages, getSentimentsComparisonData } from "../../services/emotion-check-in-services";
import { getEmployeeEmails } from "../../services/system-service";
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check";
import { completion_body, completion_subject, request_body, request_subject } from "../../utils/email-templates";
import { calculatePositiveStreak } from "../../utils/helplers";

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

        const keywords = kw ? kw.toString().trim().split(/\s+/) : [];
        const kwFilter: Prisma.EmployeeWhereInput = keywords.length > 0 ? {
            AND: keywords.map((word: string) => ({
                OR: [
                    { firstName: { contains: word, mode: 'insensitive' } },
                    { lastName: { contains: word, mode: 'insensitive' } }
                ] as Prisma.EmployeeWhereInput[]
            }))
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
                longestStreak: true,
                department: true,
                checkIns: isAllTime ? false : {
                    where: {
                        createdAt: {
                            gte: startOfDay(subDays(new Date(), +duration - 1)),
                            lte: endOfDay(new Date())
                        }
                    },
                    select: {
                        emotionScore: true,
                        createdAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        //* Calculate metric based on filter type
        const results = employees.map(employee => {
            let metric: number;
            let calculatedStreak: number = 0;

            if (isAllTime) {
                // *For all time, use longestStreak
                metric = employee.longestStreak || 0;
            } else {
                //* For 7 or 30 days, calculate streak from checkIns
                const scores = employee.checkIns.map(c => +c.emotionScore);
                calculatedStreak = calculatePositiveStreak(scores);
                metric = calculatedStreak;
            }

            return {
                fullName: employee.fullName,
                email: employee.email,
                avatar: employee.avatar,
                department: employee.department,
                streak: isAllTime ? employee.longestStreak || 0 : calculatedStreak,
                metric: metric,
                firstName: employee.firstName
            }
        })

        //* Sort by metric (desc), then firstName (asc)
        results.sort((a, b) => {
            if (b.metric !== a.metric) {
                return b.metric - a.metric
            }
            return (a.firstName || '').localeCompare(b.firstName || '')
        })

        //* Take top 7
        const top7 = results.slice(0, 7)

        //* Add ranking with tie handling
        let currentRank = 1
        let previousMetric: number | null = null
        let employeesWithSameRank = 0

        const rankedResults = top7.map((employee) => {
            if (previousMetric !== null && employee.metric < previousMetric) {
                //* Metric changed, update rank
                currentRank += employeesWithSameRank
                employeesWithSameRank = 1
            } else if (previousMetric === employee.metric) {
                //* Same metric, increment counter
                employeesWithSameRank++
            } else {
                //* First employee
                employeesWithSameRank = 1
            }

            previousMetric = employee.metric

            //* Remove internal fields from final result
            const { firstName, metric, ...employeeData } = employee

            return {
                ...employeeData,
                rank: currentRank
            }
        })

        res.status(200).json({
            message: "Here is Leaderboards data.",
            data: rankedResults,
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
                        AND: kw.toString().trim().split(/\s+/).map(word => ({
                            OR: [
                                { firstName: { contains: word, mode: 'insensitive' } },
                                { lastName: { contains: word, mode: 'insensitive' } }
                            ]
                        }))
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

        const keywords = kw ? kw.toString().trim().split(/\s+/) : [];
        const kwFilter: Prisma.EmployeeWhereInput = keywords.length > 0 ? {
            AND: keywords.map((word: string) => ({
                OR: [
                    { firstName: { contains: word, mode: "insensitive" } },
                    { lastName: { contains: word, mode: 'insensitive' } }
                ]
            }))
        } : {}

        const options = {
            take: +limit + 1,
            skip: lastCursor ? 1 : 0,
            cursor: lastCursor ? { id: +lastCursor } : undefined,
            where: {
                ...kwFilter,
                status: Status.WATCHLIST,
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

        if (!wEmp || wEmp.status !== Status.WATCHLIST) return next(createHttpErrors({
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
            data: { status: Status.NORMAL }
        })

        res.status(200).json({
            message: "Successfully deleted Watchlist Employee's Information",
            empId: updatedEmp.id
        })
    }
]

export const createActionPlan = [
    body("criticalEmpId", "Critical Employee Id is required").isInt({ gt: 0 }),
    body("depId", "Department Id is required").isInt({ gt: 0 }),
    body("contact", "Contact is required").trim().notEmpty().escape(),
    body("quickAction", "Invalid Quick Action").trim().optional().escape(),
    body("actionType", "Action Type is requied").trim().notEmpty().escape(),
    body("priority", "Priority is required").trim().notEmpty().escape(),
    body("assignTo", "Assign To is required").trim().notEmpty().escape(),
    body("dueDate", "Due Date is required").trim().notEmpty().escape(),
    body("actionNotes", "Action Notes is required").trim().notEmpty().escape(),
    body("followUpNotes", "Follow Up Notes is required").trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const superAdminEmails = await getEmployeeEmails({ role: "SUPERADMIN" })

        const { criticalEmpId, depId, contact, quickAction, actionType, priority, assignTo, dueDate, actionNotes, followUpNotes } = req.body

        //* Get the critical employee record
        const criticalEmp = await prisma.criticalEmployee.findUnique({
            where: { id: criticalEmpId },
            include: {
                actionPlan: true,
                employee: {
                    select: {
                        fullName: true,
                        avatar: true,
                    }
                },
                department: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!criticalEmp) {
            return next(createHttpErrors({
                message: "Critical employee record not found.",
                status: 404,
                code: errorCodes.notFound
            }))
        }

        //* Check if analysis already exists for this critical instance
        if (criticalEmp.actionPlan) {
            return next(createHttpErrors({
                message: "Action Plan already exists for this critical employee instance.",
                status: 400,
                code: errorCodes.invalid
            }))
        }

        await prisma.$transaction(async (tx) => {
            await tx.actionPlan.create({
                data: {
                    criticalId: criticalEmpId,
                    departmentId: depId,
                    contact,
                    actionType,
                    priority,
                    assignTo,
                    dueDate,
                    actionNotes,
                    followUpNotes,
                    quickAction: quickAction ?? null
                }
            })

            await tx.notification.create({
                data: {
                    avatar: emp!.avatar! ?? "",
                    toSAdmin: true,
                    type: NotifType.REQUEST,
                    content: `🚨 Action Plan Approval Required | ${criticalEmp.employee.fullName} from ${criticalEmp.department.name} has been flagged as critical. ${emp!.firstName} ${emp!.lastName} (${criticalEmp.department.name} HR) has submitted a ${priority} priority action plan for review. Click to review the full mental health assessment and approve or reject this intervention plan.`,
                    departmentId: depId
                }
            })
        })

        //* notify to upper management
        await EmailQueue.add('notify-email', {
            customName: `${emp?.firstName} ${emp?.lastName} | ${criticalEmp.department.name}`,
            subject: request_subject(priority),
            body: request_body(criticalEmp.employee.fullName, `${emp?.firstName} ${emp?.lastName}`, criticalEmp.department.name, actionType, priority, dueDate),
            to: superAdminEmails
        })

        res.status(201).json({
            message: "Successfully created action plan",
        })
    }
]

export const markAsCompletedActionPlan = [
    body("id", "Action Plan Id is required").isString().trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { id } = req.body

        const superAdminEmails = await getEmployeeEmails({ role: "SUPERADMIN" })

        const actionPlan = await prisma.actionPlan.findUnique({
            where: { id },
            select: {
                criticalId: true,
                criticalEmployee: {
                    select: {
                        employee: {
                            select: {
                                id: true,
                                fullName: true,
                            }
                        },
                    }
                },
                department: {
                    select: { name: true }
                },
                type: true,
            }
        })

        if (!actionPlan) return next(createHttpErrors({
            message: "There is no action plan with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (actionPlan.type === RType.COMPLETED || actionPlan.type === RType.PENDING) return next(createHttpErrors({
            message: "You cannot mark as completed to Pending/Completed type action plan.",
            status: 400,
            code: errorCodes.invalid
        }))

        await prisma.$transaction(async (tx) => {
            await tx.actionPlan.update({
                where: { id },
                data: {
                    type: RType.COMPLETED,
                    completedAt: new Date()
                }
            })

            await tx.criticalEmployee.update({
                where: { id: actionPlan.criticalId },
                data: {
                    isResolved: true,
                    resolvedAt: new Date()
                }
            })

            await tx.employee.update({
                where: { id: actionPlan.criticalEmployee.employee.id },
                data: {
                    status: Status.WATCHLIST
                }
            })

            await tx.notification.create({
                data: {
                    avatar: emp!.avatar! ?? "",
                    toSAdmin: true,
                    type: NotifType.UPDATE,
                    content: `Action plan for critical employee - ${actionPlan.criticalEmployee.employee.fullName} has been completed by ${emp?.firstName} ${emp?.lastName}. All necessary actions have been taken. ✅`,
                    departmentId: emp!.departmentId
                }
            })
        })

        await EmailQueue.add('notify-email', {
            customName: `${emp?.firstName} ${emp?.lastName} | ${actionPlan.department.name}`,
            subject: completion_subject(actionPlan.criticalEmployee.employee.fullName),
            body: completion_body(
                actionPlan.criticalEmployee.employee.fullName,
                `${emp?.firstName} ${emp?.lastName}`
            ),
            to: superAdminEmails
        })

        res.status(200).json({
            message: "Successfully updated action plan"
        })
    }
]