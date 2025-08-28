import { NextFunction, Request, Response } from "express"
import { getEmployeeById } from "../../services/auth-services"
import { authorize } from "../../utils/authorize"
import { checkEmployeeIfNotExits } from "../../utils/check"

interface CustomRequest extends Request {
    employeeId?: number
}

export const test = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const employeeId = req.employeeId
    const employee = await getEmployeeById(employeeId!)
    checkEmployeeIfNotExits(employee)

    const info: any = {
        title: 'Test Permission',
    }

    const can = authorize(true, employee!.role, "ADMIN")
    if (can) {
        info.content = "You have permission to access this route"
    }

    res.status(200).json(info)
}