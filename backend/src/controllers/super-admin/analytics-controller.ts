import { NextFunction, Request, Response } from "express"
import { checkEmployeeIfNotExits } from "../../utils/check"
import { prisma } from "../../config/prisma-client"

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