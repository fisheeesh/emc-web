import { differenceInDays } from "date-fns"
import { NextFunction, Request, Response } from "express"
import { prisma } from "../../config/prisma-client"
import { checkEmployeeIfNotExits } from "../../utils/check"
import { analyzeConcernWords, getDateRangeFromTimeRange, getStatusFromScore } from "../../utils/helplers"
import { query } from "express-validator"

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
            trend: status === 'neutral' ? 'stable' : (status === 'critical' || 'negative') ? 'down' : 'up',
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

    //* [{ department: "IT", responseTime: 2.5 }, ...]
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
        }
    })

    const transformedData = departments.map(dep => {
        let totalResponseTime = 0
        let count = 0

        //* For each critical employee, calculate time to their action plan
        dep.criticalEmployees.forEach(criticalEmp => {
            //* Only calculate if this critical employee has an action plan
            if (criticalEmp.actionPlan) {
                const daysDifference = differenceInDays(
                    criticalEmp.actionPlan.createdAt,
                    criticalEmp.createdAt
                )

                //* Only count if action plan was created after critical employee
                if (daysDifference >= 0) {
                    totalResponseTime += daysDifference
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
        message: "Here is Action Plan Avgerage Time data",
        data: transformedData
    })
}

export const getTopConcernWords = [
    query("type", "Type is required").trim().escape().optional(),
    query("timeRange", "Invalid Time Range").trim().escape().optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        const { type = 'concerns', timeRange = '90' } = req.query

        const { start, end } = getDateRangeFromTimeRange(timeRange as string)

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
                data: []
            })
        }

        const emotionTexts = emotionCheckIns
            .map(e => e.textFeeling)
            .filter(text => text && text.trim().length > 0)

        if (emotionTexts.length === 0) {
            return res.status(200).json({
                message: "No emotion check-ins with text available",
                data: [],
                recommendation: ''
            })
        }

        const { concerns, recommendation } = await analyzeConcernWords(emotionTexts)

        if (concerns.length === 0) {
            return res.status(200).json({
                message: "No concerns identified",
                data: []
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

        res.status(200).json({
            message: "Here is Employee Concern Words",
            data,
            recommendation
        })
    }
]