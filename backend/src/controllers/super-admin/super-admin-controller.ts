import { NextFunction, Request, Response } from "express"
import { body, query, validationResult } from "express-validator"
import { DEPARTMENTS } from "../../config"
import { errorCodes } from "../../config/error-codes"
import { prisma } from "../../config/prisma-client"
import { ImageQueue } from "../../jobs/queues/image-queue"
import { createEmployee, getEmployeeById } from "../../services/auth-services"
import { deleteEmployeeById, updateEmpDataById } from "../../services/emp-services"
import { checkEmployeeIfNotExits, checkUploadFile, createHttpErrors } from "../../utils/check"
import { generateHashedValue, generateToken } from "../../utils/generate"
import { removeFiles } from "../../utils/helplers"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

export const createNewEmployee = [
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

        const splitFileName = req.file?.filename?.split(".")[0]
        await ImageQueue.add("optimize-image", {
            filePath: req.file?.path,
            fileName: `${splitFileName}.webp`,
            width: 300,
            height: 300,
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

export const getAllEmployees = [
    query("empName", "Invalid Name.")
        .trim()
        .escape()
        .optional(),
    query("department", "Invalid Department.")
        .trim()
        .escape()
        .optional(),
    query("status", "Invalid Status.")
        .trim()
        .escape()
        .optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) {
            return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))
        }

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { empName, department, status } = req.query

        const result = await prisma.employee.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                fullName: true,
                phone: true,
                email: true,
                position: true,
                accType: true,
                jobType: true,
                role: true,
                avatar: true,
                createdAt: true,
                lastCritical: true,
                department: true,
                status: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        res.status(200).json({
            message: "Here is All employess in a company",
            data: result
        })
    }
]

export const updateEmployeeData = [
    body("id", "EmpId is required.").isInt({ gt: 0 }),
    body("firstName", "First Name is required.")
        .trim()
        .escape()
        .optional(),
    body("lastName", "Last Name is required.")
        .trim()
        .escape()
        .optional(),
    body("phone", "Invalid phone number.")
        .trim()
        .matches(/^[\d]+$/)
        .isLength({ min: 5, max: 12 })
        .optional(),
    body("position", "Position is required.")
        .trim()
        .escape()
        .optional(),
    body("role", "Invalid Role.")
        .trim()
        .escape()
        .optional(),
    body("accType", "Invalid Account Type.")
        .trim()
        .escape()
        .optional(),
    body("jobType", "Invalid Job Type.")
        .trim()
        .escape()
        .optional(),
    body("department", "Invalid department.")
        .trim()
        .custom(value => {
            if (!DEPARTMENTS.includes(value)) {
                throw new Error("Invalid department.")
            }
            return true
        })
        .escape()
        .optional(),
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

        const employee = req.employee
        const { id, firstName, lastName, phone, position, role, accType, jobType, department } = req.body

        const emp = await getEmployeeById(+id)

        if (!emp) {
            if (req.file) {
                await removeFiles(req.file.filename, null)
            }
            return next(createHttpErrors({
                message: "Employee not found.",
                status: 404,
                code: errorCodes.notFound
            }))
        }

        if (employee.role !== 'SUPERADMIN') {
            if (req.file) {
                await removeFiles(req.file.filename, null)
            }
            return next(createHttpErrors({
                message: "You do not have permission to manipulate this resource.",
                status: 403,
                code: errorCodes.forbidden
            }))
        }

        const data: any = {
            firstName,
            lastName,
            phone,
            position,
            role,
            accType,
            jobType,
            department,
            avatar: req.file
        }

        if (req.file) {
            data.avatar = req.file.filename

            const splitFileName = req.file.filename?.split(".")[0]

            await ImageQueue.add("optimize-image", {
                filePath: req.file.path,
                fileName: `${splitFileName}.webp`,
                width: 300,
                height: 300,
                quality: 80
            }, {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000
                }
            })

            const optimizeFile = emp.avatar?.split(".")[0] + ".webp"
            await removeFiles(emp.avatar!, optimizeFile)
        }

        const updatedEmp = await updateEmpDataById(+id, data)

        res.status(200).json({
            message: "Employee data updated successfully.",
            empId: updatedEmp.id
        })

    }
]

export const deleteEmployee = [
    body("id", "EmpId is required.").isInt({ gt: 0 }),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) {
            return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))
        }

        const { id } = req.body
        const employee = req.employee

        const emp = await getEmployeeById(+id)

        if (!emp) {
            return next(createHttpErrors({
                message: "Employee not found.",
                status: 404,
                code: errorCodes.notFound
            }))
        }

        if (employee.role !== 'SUPERADMIN') {
            return next(createHttpErrors({
                message: "You do not have permission to manipulate this resource.",
                status: 403,
                code: errorCodes.forbidden
            }))
        }

        const deletedEmp = await deleteEmployeeById(+id)

        const optimizeFile = emp.avatar?.split(".")[0] + ".webp"
        await removeFiles(emp.avatar!, optimizeFile)

        res.status(200).json({
            message: "Employee deleted successfully.",
            empId: deletedEmp.id
        })
    }
]