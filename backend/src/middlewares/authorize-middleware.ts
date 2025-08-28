import { NextFunction, Request, Response } from "express"
import { getEmployeeById } from "../services/auth-services"
import { createHttpErrors } from "../utils/helpers"
import { errorCodes } from "../config/error-codes"

interface CustomRequest extends Request {
    employeeId?: number,
    employee?: any
}

export const authorize = (permission: boolean, ...roles: string[]) => {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        const employeeId = req.employeeId
        const employee = await getEmployeeById(employeeId!)
        if (!employee) return next(createHttpErrors({
            message: 'This account has not been registered.',
            code: errorCodes.unauthenticated,
            status: 403
        }))

        const result = roles.includes(employee.role)

        if (permission && !result) {
            return next(createHttpErrors({
                message: 'You do not have permission to access this resource.',
                code: errorCodes.unauthenticated,
                status: 403
            }))
        }

        if (!permission && result) {
            return next(createHttpErrors({
                message: 'You do not have permission to access this resource.',
                code: errorCodes.unauthenticated,
                status: 403
            }))
        }

        req.employee = employee
        next()
    }
}