import { parse } from "csv-parse/sync"
import { NextFunction, Request, Response } from "express"
import { body, query, validationResult } from "express-validator"
import { AccType, Gender, JobType, Prisma, Role, WorkStyle } from "../../..//prisma/generated/prisma"
import cloudinary from "../../config/cloudinary"
import { errorCodes } from "../../config/error-codes"
import { prisma } from "../../config/prisma-client"
import { getEmployeeByEmail, getEmployeeById } from "../../services/auth-services"
import { createEmployeeWithOTP, deleteEmployeeById, getEmployeesInfiniteData, updateEmpDataById } from "../../services/emp-services"
import { checkEmployeeIfExits, checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { generateHashedValue, generateToken } from "../../utils/generate"
import { removeFiles } from "../../utils/helplers"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

interface CSVRow {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    position: string;
    department: string;
}

interface UploadResult {
    status: "success" | "failed";
    email: string;
    error?: string;
}

export const createNewEmployee = [
    body("firstName", "First Name is required.").trim().notEmpty().escape(),
    body("lastName", "Last Name is required.").trim().notEmpty().escape(),
    body("phone", "Invalid phone number.").trim().notEmpty().matches(/^[\d]+$/).isLength({ min: 5, max: 12 }),
    // body("email", "Invalid email format.").trim().notEmpty().isEmail().withMessage("Invalid email format.")
    //     .custom(value => {
    //         if (!value.endsWith("@ata.it.th")) {
    //             throw new Error("Email must be from @ata.it.th domain.")
    //         }
    //         return true
    //     }),
    body("email", "Invalid email format.")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Invalid email format."),
    body("password", "Password must meet all requirements.")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 16 })
        .withMessage("Password must be between 8 and 16 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/\d/)
        .withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]/)
        .withMessage("Password must contain at least one special character"),
    body("position", "Position is required.").trim().notEmpty(),
    body("role", "Role is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(Role).includes(value as Role)) {
                throw new Error("Invalid Role.")
            }
            return true
        }),
    body("gender", "Gender is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(Gender).includes(value as Gender)) {
                throw new Error("Invalid Gender.")
            }
            return true
        }),
    body("workStyle", "Work Style is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(WorkStyle).includes(value as WorkStyle)) {
                throw new Error("Invalid Work Style.")
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
    body("country", "Country is required.").trim().notEmpty().escape(),
    body("birthdate", "Birth Date is required.").trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) {
            if (req.file) {
                const publicId = (req.file as any).filename.split('.')[0];
                await cloudinary.uploader.destroy(`employees/avatars/${publicId}`);
            }
            return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))
        }

        const { firstName, lastName, phone, email, password, position, department, role, jobType, gender, workStyle, country, birthdate } = req.body

        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        const existEmp = await getEmployeeByEmail(email)
        checkEmployeeIfExits(existEmp)

        const activeDepartments = await prisma.department.findMany({
            where: { isActive: true },
            select: { name: true }
        });

        const activeDeptNames = new Set(activeDepartments.map(d => d.name));

        if (!activeDeptNames.has(department)) {
            if (req.file) {
                await cloudinary.uploader.destroy((req.file as any).filename);
            }
            return next(createHttpErrors({
                message: `Department '${department}' is inactive. Please activate it before adding employees.`,
                status: 400,
                code: errorCodes.invalid
            }))
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
            gender,
            workStyle,
            country,
            birthdate,
            rndToken: token,
            avatar: req.file ? (req.file as any).path : null,
            avatarPublicId: req.file ? (req.file as any).filename : null
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

        const emp = req.employee
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
                gender: true,
                birthdate: true,
                workStyle: true,
                country: true,
                age: true,
                role: true,
                avatar: true,
                createdAt: true,
                lastCritical: true,
                department: true,
                status: true,
                checkIns: true,
                _count: {
                    select: {
                        criticalTimes: true
                    }
                }
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

export const updateEmployeeInformation = [
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
    body("gender", "Gender is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(Gender).includes(value as Gender)) {
                throw new Error("Invalid Gender.")
            }
            return true
        }),
    body("workStyle", "Work Style is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(WorkStyle).includes(value as WorkStyle)) {
                throw new Error("Invalid Work Style.")
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
    body("country", "Country is required.").trim().notEmpty().escape(),
    body("birthdate", "Birth Date is required.").trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) {
            if (req.file) {
                try {
                    await cloudinary.uploader.destroy((req.file as any).filename);
                } catch (error) {
                    console.error('Error deleting file from Cloudinary:', error);
                }
            }
            return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))
        }

        const sEmp = req.employee
        checkEmployeeIfNotExits(sEmp)

        const { id, firstName, lastName, phone, position, role, gender, workStyle, jobType, accType, department, country, birthdate } = req.body

        const emp = await getEmployeeById(+id)

        if (!emp) {
            if (req.file) {
                try {
                    await cloudinary.uploader.destroy((req.file as any).filename);
                } catch (error) {
                    console.error('Error deleting file from Cloudinary:', error);
                }
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
            workStyle,
            gender,
            country,
            birthdate,
            jobType,
            accType,
            department,
            avatar: req.file
        }

        if (req.file) {
            //* Store the new Cloudinary URL and public_id
            data.avatar = (req.file as any).path;
            data.avatarPublicId = (req.file as any).filename;

            //* Delete the old image from Cloudinary if it exists
            if (emp.avatarPublicId) {
                try {
                    await cloudinary.uploader.destroy(emp.avatarPublicId);
                    console.log('Old avatar deleted from Cloudinary:', emp.avatarPublicId);
                } catch (error) {
                    console.error('Error deleting old avatar from Cloudinary:', error);
                }
            }
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

        const sEmp = req.employee
        checkEmployeeIfNotExits(sEmp)

        const { id } = req.body

        const emp = await getEmployeeById(+id)

        if (!emp) {
            return next(createHttpErrors({
                message: "Employee not found.",
                status: 404,
                code: errorCodes.notFound
            }))
        }

        if (emp.role === 'SUPERADMIN') return next(createHttpErrors({
            message: "Cannot delete Super Admin account.",
            status: 400,
            code: errorCodes.invalid
        }))

        const deletedEmp = await deleteEmployeeById(+id)

        const optimizeFile = emp.avatar?.split(".")[0] + ".webp"
        await removeFiles(emp.avatar!, optimizeFile)

        res.status(200).json({
            message: "Employee deleted successfully.",
            empId: deletedEmp.id
        })
    }
]

export const bulkRegister = [
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        //* Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "No CSV file uploaded",
            });
        }

        //? Parse CSV file
        let records: CSVRow[];
        try {
            records = parse(req.file.buffer, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }) as CSVRow[];
        } catch (parseError) {
            return res.status(400).json({
                message: "Invalid CSV format. Please check your file.",
            });
        }

        //? Validate CSV has data
        if (!records || records.length === 0) {
            return res.status(400).json({
                message: "CSV file is empty",
            });
        }

        //* Expected headers
        const requiredHeaders = ['firstName', 'lastName', 'email', 'password', 'position', 'department'];
        const firstRecord = records[0];
        const headers = Object.keys(firstRecord);

        //* Validate headers
        const hasAllHeaders = requiredHeaders.every(header => headers.includes(header));
        if (!hasAllHeaders) {
            return res.status(400).json({
                message: `CSV must have headers: ${requiredHeaders.join(', ')}`,
            });
        }

        const activeDepartments = await prisma.department.findMany({
            where: { isActive: true },
            select: { name: true }
        });

        const activeDeptNames = new Set(activeDepartments.map(d => d.name));

        const results: UploadResult[] = [];
        let successCount = 0;
        let failureCount = 0;

        //* Process each record
        for (const record of records) {
            try {
                //* Validate required fields
                if (!record.firstName || !record.lastName || !record.email || !record.password || !record.position || !record.department) {
                    results.push({
                        status: "failed",
                        email: record.email || "unknown",
                        error: "Missing required fields",
                    });
                    failureCount++;
                    continue;
                }

                //* Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(record.email)) {
                    results.push({
                        status: "failed",
                        email: record.email,
                        error: "Invalid email format",
                    });
                    failureCount++;
                    continue;
                }

                if (!activeDeptNames.has(record.department)) {
                    results.push({
                        status: 'failed',
                        email: record.email,
                        error: `Department '${record.department}' is inactive. Please activate it before adding employees.`
                    });
                    failureCount++;
                    continue;
                }

                //* Validate password
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]).{8,16}$/;

                if (!passwordRegex.test(record.password)) {
                    results.push({
                        status: "failed",
                        email: record.email,
                        error: "Password must be 8-16 characters with at least one uppercase, one lowercase, one number, and one special character",
                    });
                    failureCount++;
                    continue;
                }

                //* Check if exisint user or not
                const existingUser = await getEmployeeByEmail(record.email);

                if (existingUser) {
                    results.push({
                        status: "failed",
                        email: record.email,
                        error: "Employee with this email already exists",
                    });
                    failureCount++;
                    continue;
                }

                const otp = 123456
                const hashedOTP = await generateHashedValue(otp.toString())
                const hashedPassword = await generateHashedValue(record.password)
                const token = generateToken()

                const otpData = {
                    email: record.email,
                    otp: hashedOTP,
                    rememberToken: generateToken(),
                    count: 1
                }

                await createEmployeeWithOTP({
                    firstName: record.firstName,
                    lastName: record.lastName,
                    email: record.email,
                    password: hashedPassword,
                    position: record.position,
                    department: record.department,
                    rndToken: token,
                }, otpData)

                results.push({
                    status: "success",
                    email: record.email,
                });
                successCount++;
            } catch (error) {
                console.error(`Error processing user ${record.email}:`, error);
                results.push({
                    status: "failed",
                    email: record.email,
                    error: "Failed to create user",
                });
                failureCount++;
            }
        }

        return res.status(200).json({
            message: `Bulk registration completed. Success: ${successCount}, Failed: ${failureCount}`,
            results,
            successCount,
            failureCount,
        });
    }
];
