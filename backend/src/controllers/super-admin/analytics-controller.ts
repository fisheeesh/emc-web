import { NextFunction, Request, Response } from "express"
import { checkEmployeeIfNotExits } from "../../utils/check"
import { prisma } from "../../config/prisma-client"
import { getStatusFromScore } from "../../utils/helplers"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

export const getActionPlanStatus = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const employee = req.employee
    checkEmployeeIfNotExits(employee)

    const actionPlans = await prisma.actionPlan.groupBy({
        by: ['status'],
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
        status: 'Here is the action plan status data',
        data,
    })
}

export const getDepartmentsHeatmap = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const employee = req.employee
    checkEmployeeIfNotExits(employee)

    const departments = await prisma.department.findMany({
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