import { differenceInHours } from "date-fns"
import { NextFunction, Request, Response } from "express"
import { query } from "express-validator"
import { prisma } from "../../config/prisma-client"
import { checkEmployeeIfNotExits } from "../../utils/check"
import { analyzeConcernWords, getDateRangeFromTimeRange, getStatusFromScore } from "../../utils/helplers"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

export const getActionPlanStatus = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const employee = req.employee
    checkEmployeeIfNotExits(employee)

    const actionPlans = await prisma.actionPlan.groupBy({
        by: ['status'],
        where: {
            department: {
                isActive: true
            }
        },
        _count: {
            status: true,
        },
    })

    const allStatuses = ['pending', 'approved', 'rejected']

    const statusMap = new Map(
        actionPlans.map(plan => [plan.status.toLowerCase(), plan._count.status])
    )

    const data = allStatuses.map(status => ({
        status,
        count: statusMap.get(status) || 0,
        fill: `var(--color-${status})`,
    }))

    res.status(200).json({
        message: 'Here is the action plan status data',
        data,
    })
}

export const getDepartmentsHeatmap = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const employee = req.employee
    checkEmployeeIfNotExits(employee)

    const departments = await prisma.department.findMany({
        where: {
            isActive: true
        },
        select: {
            name: true,
            employees: {
                select: {
                    avgScore: true,
                },
            },
            _count: {
                select: {
                    employees: true,
                }
            },
        },
    })

    const transformedData = departments.map(dept => {
        const totalScore = dept.employees.reduce((sum, emp) => sum + +emp.avgScore, 0)
        const avgScore = dept.employees.length ? (totalScore / dept.employees.length) : 0

        const status = getStatusFromScore(avgScore)

        return {
            name: dept.name,
            avgScore: parseFloat(avgScore.toFixed(2)),
            status,
            employees: dept._count.employees,
            trend: status === 'neutral'
                ? 'stable'
                : (status === 'critical' || status === 'negative')
                    ? 'down'
                    : 'up',
        }
    })

    res.status(200).json({
        status: 'Here is the departments heatmap data',
        data: transformedData,
    })
}

export const getActionAvgReponseTime = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const emp = req.employee
    checkEmployeeIfNotExits(emp)

    const departments = await prisma.department.findMany({
        where: {
            isActive: true
        },
        select: {
            name: true,
            criticalEmployees: {
                select: {
                    createdAt: true,
                    actionPlan: {
                        select: {
                            createdAt: true,
                        }
                    }
                }
            },
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    const transformedData = departments.map(dep => {
        let totalResponseTime = 0
        let count = 0

        dep.criticalEmployees.forEach(criticalEmp => {
            if (criticalEmp.actionPlan) {
                const hoursDifference = differenceInHours(
                    criticalEmp.actionPlan.createdAt,
                    criticalEmp.createdAt
                )

                if (hoursDifference >= 0) {
                    totalResponseTime += hoursDifference
                    count++
                }
            }
        })

        return {
            department: dep.name,
            responseTime: count > 0 ? parseFloat((totalResponseTime / count).toFixed(2)) : 0
        }
    })

    res.status(200).json({
        message: "Here is Action Plan Average Time data (in hours)",
        data: transformedData
    })
}

export const getTopConcernWords = [
    query("type", "Type is required").trim().escape().optional(),
    query("timeRange", "Invalid Time Range").trim().escape().optional(),
    query("forceRefresh", "Force refresh flag").trim().escape().optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        const {
            type = 'concerns',
            timeRange = '7',
            forceRefresh = 'false'
        } = req.query

        const { start, end } = getDateRangeFromTimeRange(timeRange as string)

        //* Check for cached results -> less than 24 hours old 
        if (forceRefresh !== 'true') {
            const cached = await prisma.concernAnalysis.findFirst({
                where: {
                    timeRange: timeRange as string,
                    generatedAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                },
                orderBy: {
                    generatedAt: 'desc'
                }
            })

            //* If cached return cached for data consistency
            if (cached) {
                return res.status(200).json({
                    message: "Here is Employee Concern Words (cached)",
                    data: cached.data,
                    recommendation: cached.recommendation,
                    generatedAt: cached.generatedAt,
                    isCached: true
                })
            }
        }

        const emotionCheckIns = await prisma.emotionCheckIn.findMany({
            where: {
                employee: {
                    department: {
                        isActive: true
                    }
                },
                createdAt: {
                    gte: start,
                    lte: end
                }
            },
            select: {
                textFeeling: true
            }
        })

        if (emotionCheckIns.length === 0) {
            return res.status(200).json({
                message: "No emotion check-ins available",
                data: [],
                isCached: false
            })
        }

        const emotionTexts = emotionCheckIns
            .map(e => e.textFeeling)
            .filter(text => text && text.trim().length > 0)

        if (emotionTexts.length === 0) {
            return res.status(200).json({
                message: "No emotion check-ins with text available",
                data: [],
                recommendation: '',
                isCached: false
            })
        }

        const { concerns, recommendation } = await analyzeConcernWords(emotionTexts)

        if (concerns.length === 0) {
            return res.status(200).json({
                message: "No concerns identified",
                data: [],
                isCached: false
            })
        }

        const maxCount = Math.max(...concerns.map(c => c.count))
        const minCount = Math.min(...concerns.map(c => c.count))

        const data = concerns.map(concern => ({
            word: concern.word,
            count: concern.count,
            size: minCount === maxCount
                ? 2
                : 1 + Math.round(((concern.count - minCount) / (maxCount - minCount)) * 2)
        })).sort((a, b) => b.count - a.count)

        //* Cache the results every time ai analyzed
        await prisma.concernAnalysis.create({
            data: {
                timeRange: timeRange as string,
                data: data as any,
                recommendation
            }
        })

        res.status(200).json({
            message: "Here is Employee Concern Words",
            data,
            recommendation,
            generatedAt: new Date(),
            isCached: false
        })
    }
]