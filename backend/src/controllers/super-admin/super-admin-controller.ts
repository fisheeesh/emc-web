import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import { checkEmployeeIfNotExits, checkUploadFile, createHttpErrors } from "../../utils/check"
import { errorCodes } from "../../config/error-codes"
import { createEmployee, getEmployeeById } from "../../services/auth-services"
import { DEPARTMENTS } from "../../config"
import { ImageQueue } from "../../jobs/queues/image-queue"
import { generateHashedValue, generateToken } from "../../utils/generate"
import { removeFiles } from "../../utils/helplers"

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
    body("department", "Invalid department.")
        .trim()
        .notEmpty()
        .custom(value => {
            if (!DEPARTMENTS.includes(value)) {
                throw new Error("Invalid department.")
            }
            return true
        })
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

        const { firstName, lastName, phone, email, password, position, department } = req.body

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)

        checkEmployeeIfNotExits(emp)
        checkUploadFile(req.file)

        const splitFileName = req.file?.filename.split(".")[0]
        await ImageQueue.add("optimize-image", {
            filePath: req.file?.path,
            fileName: `${splitFileName}.webp`,
            width: 835,
            height: 577,
            quality: 100
        }, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000
            }
        })

        const hashedPassword = await generateHashedValue(password)
        const token = generateToken()

        const data: any = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            position,
            department,
            rndToken: token,
            avatar: req.file?.filename
        }

        const newEmp = await createEmployee(data)

        res.status(201).json({
            message: "Successfully create next employee.",
            empId: newEmp.id
        })
    }
]