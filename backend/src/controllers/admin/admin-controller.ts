import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { PrismaClient, Status } from "../../../generated/prisma";
import { errorCodes } from "../../config/error-codes";
import { prisma } from "../../config/prisma-client";
import { EmailQueue } from "../../jobs/queues/email-queue";
import { getAdminUserData } from "../../services/admin-services";
import { getEmployeeById } from "../../services/auth-services";
import { getAllDepartmentsData } from "../../services/system-service";
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check";
import { completion_body, completion_subject, request_body, request_subject } from "../../utils/email-templates";

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

    const results = await prisma.notification.findMany({
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

export const markAsReadNotification = [
    body("id", "Notification Id is required").isInt().toInt(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { id } = req.body

        const notification = await prisma.notification.findUnique({
            where: { id: Number(id) }
        })

        if (!notification) return next(createHttpErrors({
            message: "There is no notification with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        await prisma.notification.update({
            where: { id: Number(id) },
            data: {
                status: "READ"
            }
        })

        res.status(200).json({
            message: "Successfully marked as read notification"
        })
    }
]

export const createActionPlan = [
    body("criticalEmpId", "Critical Employee Id is required").isInt({ gt: 0 }),
    body("depId", "Department Id is required").isInt({ gt: 0 }),
    body("contact", "Contact is required").trim().notEmpty().escape(),
    body("quickAction", "Invalid Quick Action").trim().optional().escape(),
    body("actionType", "Action Type is requied").trim().notEmpty().escape(),
    body("priority", "Priority is required").trim().notEmpty().escape(),
    body("assignTo", "Assign To is required").trim().notEmpty().escape(),
    body("dueDate", "Due Date is required").trim().notEmpty().escape(),
    body("actionNotes", "Action Notes is required").trim().notEmpty().escape(),
    body("followUpNotes", "Follow Up Notes is required").trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { criticalEmpId, depId, contact, quickAction, actionType, priority, assignTo, dueDate, actionNotes, followUpNotes } = req.body

        //* Get the critical employee record
        const criticalEmp = await prisma.criticalEmployee.findUnique({
            where: { id: criticalEmpId },
            include: {
                actionPlan: true,
                employee: {
                    select: {
                        fullName: true,
                        avatar: true,
                    }
                },
                department: {
                    select: {
                        name: true
                    }
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

        //* Check if analysis already exists for this critical instance
        if (criticalEmp.actionPlan) {
            return next(createHttpErrors({
                message: "Action Plan already exists for this critical employee instance.",
                status: 400,
                code: errorCodes.invalid
            }))
        }

        await prisma.$transaction(async (tx) => {
            await tx.actionPlan.create({
                data: {
                    criticalId: criticalEmpId,
                    departmentId: depId,
                    contact,
                    actionType,
                    priority,
                    assignTo,
                    dueDate,
                    actionNotes,
                    followUpNotes,
                    quickAction: quickAction ?? null
                }
            })

            await tx.notification.create({
                data: {
                    avatar: emp!.avatar! ?? "",
                    toSAdmin: true,
                    type: 'REQUEST',
                    content: `🚨 Action Plan Approval Required | ${criticalEmp.employee.fullName} from ${criticalEmp.department.name} has been flagged as critical. ${emp!.firstName} ${emp!.lastName} (${criticalEmp.department.name} HR) has submitted a ${priority} priority action plan for review. Click to review the full mental health assessment and approve or reject this intervention plan.`,
                    departmentId: depId
                }
            })
        })

        //* notify to upper management
        await EmailQueue.add('notify-email', {
            subject: request_subject(priority),
            body: request_body(criticalEmp.employee.fullName, `${emp?.firstName} ${emp?.lastName}`, criticalEmp.department.name, actionType, priority, dueDate),
        })

        res.status(201).json({
            message: "Successfully created action plan",
        })
    }
]

export const markAsCompletedActionPlan = [
    body("id", "Action Plan Id is required").isString().trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { id } = req.body

        const actionPlan = await prisma.actionPlan.findUnique({
            where: { id },
            select: {
                criticalId: true,
                criticalEmployee: {
                    select: {
                        employee: {
                            select: {
                                id: true,
                                fullName: true,
                            }
                        },
                    }
                },
                type: true,
            }
        })

        if (!actionPlan) return next(createHttpErrors({
            message: "There is no action plan with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (actionPlan.type === 'COMPLETED' || actionPlan.type === 'PENDING') return next(createHttpErrors({
            message: "You cannot mark as completed to Pending/Completed type action plan.",
            status: 400,
            code: errorCodes.invalid
        }))

        await prisma.$transaction(async (tx) => {
            await tx.actionPlan.update({
                where: { id },
                data: {
                    type: "COMPLETED",
                    completedAt: new Date()
                }
            })

            await tx.criticalEmployee.update({
                where: { id: actionPlan.criticalId },
                data: {
                    isResolved: true,
                    resolvedAt: new Date()
                }
            })

            await tx.employee.update({
                where: { id: actionPlan.criticalEmployee.employee.id },
                data: {
                    status: Status.WATCHLIST
                }
            })

            await tx.notification.create({
                data: {
                    avatar: emp!.avatar! ?? "",
                    toSAdmin: true,
                    type: "UPDATE",
                    content: `Action plan for critical employee - ${actionPlan.criticalEmployee.employee.fullName} has been completed by ${emp?.firstName} ${emp?.lastName}. All necessary actions have been taken. ✅`,
                    departmentId: emp!.departmentId
                }
            })
        })

        await EmailQueue.add('notify-email', {
            subject: completion_subject(actionPlan.criticalEmployee.employee.fullName),
            body: completion_body(
                actionPlan.criticalEmployee.employee.fullName,
                `${emp?.firstName} ${emp?.lastName}`
            )
        })

        res.status(200).json({
            message: "Successfully updated action plan"
        })
    }
]


