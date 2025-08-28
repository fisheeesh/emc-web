import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import sanitizeHtml from 'sanitize-html'
import { errorCodes } from "../../config/error-codes"
import { getEmployeeById } from "../../services/auth-services"
import { authorize } from "../../utils/authorize"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"

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

export const emotionCheckIn = [
    body("moodMessage", "Moode Message is required.")
        .trim()
        .notEmpty()
        .customSanitizer(value => sanitizeHtml(value)).notEmpty(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { moodMessage } = req.body
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const [emoji, textFeeling] = moodMessage.split(',')
    }
]