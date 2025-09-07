import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { errorCodes } from "../../config/error-codes"
import { getEmployeeById } from "../../services/auth-services"
import path from "path"
import { unlink } from "node:fs/promises";

interface CustomRequest extends Request {
    employeeId?: number
}

const removeFiles = async (originalFile: string, optimizeFile?: string | null) => {
    try {
        const originalFilePath = path.join(
            __dirname,
            "../../../",
            "/uploads/images",
            originalFile
        )
        await unlink(originalFilePath)

        if (optimizeFile) {
            const optimizeFilePath = path.join(
                __dirname,
                "../../../",
                "/uploads/optimizes",
                optimizeFile
            )
            await unlink(optimizeFilePath)
        }

    } catch (error) {
        console.log(error)
    }
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
    body("phone", "Invalid phone number.")
        .trim()
        .notEmpty()
        .matches(/^[\d]+$/)
        .isLength({ min: 5, max: 12 }),
    body("email", "Invalid email format.")
        .trim()
        .notEmpty()
        .isEmail().withMessage("Invalid email format.")
        .custom(value => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must be from @ata.it.th domain.")
            }
            return true
        }),
    body("password", "Password must be at least 8 digits.")
        .trim()
        .notEmpty()
        .matches(/^[\d]+$/)
        .isLength({ min: 8, max: 8 }),
    body("position", "Position is required.")
        .trim()
        .notEmpty()
        .escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) {
            if (req.file) {
                await removeFiles(req.file.filename, null)
            }
            return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))
        }

        const { firstName, lastName, phone, email, password, position } = req.body

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        res.status(201).json({
            message: "Successfully create next employee.",
        })
    }
]