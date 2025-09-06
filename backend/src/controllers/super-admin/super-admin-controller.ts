import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { errorCodes } from "../../config/error-codes"
import { getEmployeeById } from "../../services/auth-services"

interface CustomRequest extends Request {
    employeeId?: number
}

export const createNextEmployee = [
    body("firstName", "First Name is required.")
        .trim()
        .notEmpty()
        .escape(),
    body("lastName", "Last Name is required.")
        .trim()
        .notEmpty()
        .escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { firstName, lastName } = req.body

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        res.status(201).json({
            message: "Successfully create next employee.",
        })
    }
]