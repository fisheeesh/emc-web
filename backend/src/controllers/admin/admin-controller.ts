import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../../../generated/prisma";
import { getAdminUserData } from "../../services/admin-services";
import { getEmployeeById } from "../../services/auth-services";
import { getAllDepartmentsData } from "../../services/system-service";
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check";
import { body, validationResult } from "express-validator";
import { errorCodes } from "../../config/error-codes";
import { prisma } from "../../config/prisma-client";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { NotesQueue, NotesQueueEvents } from "../../jobs/queues/notes-queue";

interface CustomRequest extends Request {
    employeeId?: number
}

const prismaClient = new PrismaClient()

export const testAdmin = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "You have permission to access this route"
    })
}

export const getAllDepartments = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const result = await getAllDepartmentsData()

    res.status(200).json({
        message: "Here is All Departments Data.",
        data: result
    })
}

export const getAdminUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const result = await getAdminUserData(emp!.id)

    res.status(200).json({
        message: "Here is Admin User Data.",
        data: result
    })
}

export const getAllNotifications = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId

    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const isSAdmin = emp!.role === 'SUPERADMIN'

    const results = await prismaClient.notification.findMany({
        where: isSAdmin
            ? { toSAdmin: true }
            : {
                departmentId: emp!.departmentId,
                toSAdmin: false
            },
        orderBy: {
            createdAt: 'desc'
        }
    })

    res.status(200).json({
        message: "Here is all notifications",
        data: results
    })
}

// Controller - generateAINotes
export const generateAINotes = [
    body("criticalEmpId", "Critical Employee Id is required.").isInt({ gt: 0 }),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { criticalEmpId } = req.body

        //* Get the critical employee record
        const criticalEmp = await prisma.criticalEmployee.findUnique({
            where: { id: criticalEmpId },
            include: {
                employee: {
                    select: { fullName: true }
                }
            }
        })

        if (!criticalEmp) {
            return next(createHttpErrors({
                message: "Critical employee record not found.",
                status: 404,
                code: errorCodes.notFound
            }))
        }

        //* Calculate date range - 7 days before the critical date
        const end = new Date(criticalEmp.createdAt)
        const start = subDays(end, 6)

        //* Fetch emotion check-ins for the 7 days leading up to becoming critical
        const emotionCheckIns = await prisma.emotionCheckIn.findMany({
            where: {
                employeeId: criticalEmp.employeeId,
                createdAt: {
                    gte: startOfDay(start),
                    lte: endOfDay(end)
                }
            },
            select: {
                textFeeling: true,
                emoji: true,
                checkInTime: true,
                emotionScore: true,
                status: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "asc"
            }
        })

        if (emotionCheckIns.length === 0) {
            return next(createHttpErrors({
                message: "No emotion check-ins found for this employee in the last 7 days.",
                status: 404,
                code: errorCodes.notFound
            }))
        }

        try {
            //* Add job to the queue
            const job = await NotesQueue.add('generate-notes', {
                empName: criticalEmp.employee.fullName,
                emotionCheckIns
            })

            //* Wait for the job to complete using QueueEvents
            const result = await job.waitUntilFinished(NotesQueueEvents, 60000)

            //* Return the generated markdown directly
            res.status(200).json({
                success: true,
                message: "AI notes generated successfully",
                data: result
            })

        } catch (error: any) {
            console.error("Error generating AI notes:", error)

            if (error.message?.includes('timeout')) {
                return next(createHttpErrors({
                    message: "AI notes generation is taking longer than expected. Please try again.",
                    status: 408,
                    code: errorCodes.timeout
                }))
            }

            return next(createHttpErrors({
                message: "Failed to generate AI notes. Please try again.",
                status: 500,
                code: errorCodes.server
            }))
        }
    }
]


