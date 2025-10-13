import { NextFunction, Request, Response } from "express"
import { body, query, validationResult } from "express-validator"
import { AccType, JobType, Prisma, Role } from "../../../generated/prisma"
import { DEPARTMENTS } from "../../config"
import { errorCodes } from "../../config/error-codes"
import { ImageQueue } from "../../jobs/queues/image-queue"
import { createEmployeeWithOTP, getEmployeeByEmail, getEmployeeById } from "../../services/auth-services"
import { deleteEmployeeById, getEmployeesInfiniteData, updateEmpDataById } from "../../services/emp-services"
import { checkEmployeeIfExits, checkEmployeeIfNotExits, checkUploadFile, createHttpErrors } from "../../utils/check"
import { generateHashedValue, generateToken } from "../../utils/generate"
import { removeFiles } from "../../utils/helplers"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

export const createNewEmployee = [
    body("firstName", "First Name is required.").trim().notEmpty().escape(),
    body("lastName", "Last Name is required.").trim().notEmpty().escape(),
    body("phone", "Invalid phone number.").trim().notEmpty().matches(/^[\d]+$/).isLength({ min: 5, max: 12 }),
    body("email", "Invalid email format.").trim().notEmpty().isEmail().withMessage("Invalid email format.")
        .custom(value => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must be from @ata.it.th domain.")
            }
            return true
        }),
    body("password", "Password must be at least 8 digits.").trim().notEmpty().matches(/^[\d]+$/).isLength({ min: 8, max: 8 }),
    body("position", "Position is required.").trim().notEmpty().escape(),
    body("role", "Role is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(Role).includes(value as Role)) {
                throw new Error("Invalid Role.")
            }
            return true
        }),
    body("jobType", "Job Type is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(JobType).includes(value as JobType)) {
                throw new Error("Invalid Job Type.")
            }
            return true
        }),
    body("department", "Department is required.").trim().notEmpty().escape(),
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

        const { firstName, lastName, phone, email, password, position, department, role, jobType } = req.body

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)

        checkEmployeeIfNotExits(emp)


        const existEmp = await getEmployeeByEmail(email)
        checkEmployeeIfExits(existEmp)

        if (req.file) {
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
        }

        const otp = 123456
        const hashedOTP = await generateHashedValue(otp.toString())
        const hashedPassword = await generateHashedValue(password)
        const token = generateToken()

        const empData: any = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            position,
            role,
            jobType,
            department,
            rndToken: token,
            avatar: req.file?.filename
        }

        const otpData = {
            email,
            otp: hashedOTP,
            rememberToken: generateToken(),
            count: 1
        }

        const newEmp = await createEmployeeWithOTP(empData, otpData)

        res.status(201).json({
            message: "Successfully create next employee.",
            empId: newEmp.id
        })
    }
]

export const getAllEmployeesInfinite = [
    query("limit", "Limit must be LogId.").isInt({ gt: 6 }).optional(),
    query("cursor", "Cursor must be unsigned integer.").isInt({ gt: 0 }).optional(),
    query("kw", "Invalid Keyword.").trim().escape().optional(),
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("role", "Invalid Role.").trim().escape().optional(),
    query("jobType", "Invalid Job Type.").trim().escape().optional(),
    query("accType", "Invalid Account Type.").trim().escape().optional(),
    query("status", "Invalid Status.").trim().escape().optional(),
    query("ts", "Invalid Timestamp.").trim().escape().optional(),
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

        const { limit = 7, cursor: lastCursor, kw, dep, role, jobType, accType, status, ts = 'desc' } = req.query

        const kwFilter: Prisma.EmployeeWhereInput = kw ? {
            OR: [
                { firstName: { contains: kw as string, mode: 'insensitive' } },
                { lastName: { contains: kw as string, mode: 'insensitive' } },
                { email: { contains: kw as string, mode: 'insensitive' } },
                { position: { contains: kw as string, mode: 'insensitive' } },
            ] as Prisma.EmployeeWhereInput[]
        } : {}

        const roleFilter: Prisma.EmployeeWhereInput =
            role && role !== "all" &&
                Object.values(Role).includes(role as Role)
                ? { role: role as Role }
                : {};

        const depFilter: Prisma.EmployeeWhereInput =
            dep && dep !== 'all' ? {
                departmentId: +dep
            } : {}

        const jobFilter: Prisma.EmployeeWhereInput =
            jobType && jobType !== 'all' &&
                Object.values(JobType).includes(jobType as JobType)
                ? { jobType: jobType as JobType }
                : {}

        const accTypeFilter: Prisma.EmployeeWhereInput =
            accType && accType !== 'all' &&
                Object.values(AccType).includes(accType as AccType)
                ? { accType: accType as AccType }
                : {}

        const options = {
            take: +limit + 1,
            skip: lastCursor ? 1 : 0,
            cursor: lastCursor ? { id: +lastCursor } : undefined,
            where: {
                ...depFilter,
                ...roleFilter,
                ...jobFilter,
                ...accTypeFilter,
                ...kwFilter,
            },
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
                createdAt: ts
            }
        }

        const employees = await getEmployeesInfiniteData(options, status as string)
        const hasNextPage = employees.length > +limit

        if (hasNextPage) {
            employees.pop()
        }

        const nextCursor = hasNextPage ? employees[employees.length - 1].id : null

        res.status(200).json({
            message: "Here is all employees data with infinite scroll.",
            hasNextPage,
            nextCursor,
            prevCursor: lastCursor || undefined,
            data: employees
        })
    }
]

export const updateEmployeeData = [
    body("id", "EmpId is required.").isInt({ gt: 0 }),
    body("firstName", "First Name is required.").trim().notEmpty().escape(),
    body("lastName", "Last Name is required.").trim().notEmpty().escape(),
    body("phone", "Invalid phone number.").trim().notEmpty().matches(/^[\d]+$/).isLength({ min: 5, max: 12 }),
    body("position", "Position is required.").trim().notEmpty().escape(),
    body("role", "Role is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(Role).includes(value as Role)) {
                throw new Error("Invalid Role.")
            }
            return true
        }),
    body("jobType", "Job Type is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(JobType).includes(value as JobType)) {
                throw new Error("Invalid Job Type.")
            }
            return true
        }),
    body("accType", "Account Type is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(AccType).includes(value as AccType)) {
                throw new Error("Invalid Job Type.")
            }
            return true
        }),
    body("department", "Department is required.").trim().notEmpty().escape(),
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

        const { id, firstName, lastName, phone, position, role, jobType, accType, department } = req.body

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

        const data: any = {
            firstName,
            lastName,
            phone,
            position,
            role,
            jobType,
            accType,
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
    body("id", "Employee Id is required.").isInt({ gt: 0 }),
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

        const emp = await getEmployeeById(+id)

        if (!emp) {
            return next(createHttpErrors({
                message: "Employee not found.",
                status: 404,
                code: errorCodes.notFound
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