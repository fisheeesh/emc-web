import { NextFunction, Request, Response } from "express"
import { body, query, validationResult } from "express-validator"
import { Priority, Prisma, RStatus, RType } from "../../../prisma/generated/prisma"
import { errorCodes } from "../../config/error-codes"
import { prisma } from "../../config/prisma-client"
import { EmailQueue } from "../../jobs/queues/email-queue"
import { getAllActionPlansInfinite } from "../../services/action-plan-services"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { rejected_delete_body, rejected_delete_subject, response_body, response_subject } from "../../utils/email-templates"
import { getNotificationContent } from "../../utils/helplers"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

export const getAllActionPlans = [
    query("limit", "Limit must be LogId.").isInt({ gt: 6 }).optional(),
    query("cursor", "Cursor must be unsigned integer.").isInt({ gt: 0 }).optional(),
    query("dep", "Invalid Department.").isInt({ gt: 0 }).optional(),
    query("kw", "Invalid Keyword.").trim().escape().optional(),
    query("priority", "Invalid Priority.").trim().escape().optional(),
    query("status", "Invalid Status.").trim().escape().optional(),
    query("type", "Invalid Type.").trim().escape().optional(),
    query("ts", "Invalid Timestamp.").trim().escape().optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        const { limit = 7, cursor: lastCursor, dep, kw, priority, status, type, ts = 'desc' } = req.query

        const depFilter: Prisma.ActionPlanWhereInput =
            dep && dep !== 'all' ? {
                department: {
                    isActive: true,
                },
                departmentId: +dep
            } : {}

        const priorityFilter: Prisma.ActionPlanWhereInput =
            priority && priority !== "all" &&
                Object.values(Priority).includes(priority as Priority)
                ? { priority: priority as Priority }
                : {};

        const statusFilter: Prisma.ActionPlanWhereInput =
            status && status !== "all" &&
                Object.values(RStatus).includes(status as RStatus)
                ? { status: status as RStatus }
                : {};

        const typeFilter: Prisma.ActionPlanWhereInput =
            type && type !== "all" &&
                Object.values(RType).includes(type as RType)
                ? { type: type as RType }
                : {};

        const options = {
            take: +limit + 1,
            skip: lastCursor ? 1 : 0,
            cursor: lastCursor ? { id: +lastCursor } : undefined,
            where: {
                ...depFilter,
                ...priorityFilter,
                ...statusFilter,
                ...typeFilter,
                ...(kw && {
                    criticalEmployee: {
                        employee: {
                            OR: [
                                { firstName: { contains: kw as string, mode: 'insensitive' } },
                                { lastName: { contains: kw as string, mode: 'insensitive' } },
                            ]
                        }
                    }
                })
            },
            select: {
                id: true,
                department: true,
                criticalEmployee: {
                    select: {
                        employee: {
                            select: {
                                fullName: true
                            }
                        },
                        resolvedAt: true
                    }
                },
                contact: true,
                priority: true,
                status: true,
                type: true,
                createdAt: true,
                dueDate: true,
                completedAt: true,
                assignTo: true,
                actionType: true,
                quickAction: true,
                actionNotes: true,
                followUpNotes: true,
                suggestions: true
            },
            orderBy: {
                createdAt: ts
            }
        }

        const actionPlans = await getAllActionPlansInfinite(options)

        const hasNextPage = actionPlans.length > +limit

        if (hasNextPage) actionPlans.pop()

        const nextCursor = hasNextPage ? actionPlans![actionPlans.length - 1].id : null

        res.status(200).json({
            message: "Here is all action plans with infinite scroll.",
            hasNextPage,
            nextCursor,
            prevCursor: lastCursor || undefined,
            data: actionPlans
        })
    }
]

export const deleteActionPlanById = [
    body("id", "Action Plan Id is  required").isString().trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        const { id } = req.body

        const actionPlan = await prisma.actionPlan.findUnique({
            where: { id },
            select: {
                criticalEmployee: {
                    select: {
                        employee: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                status: true,
                departmentId: true,
                contact: true
            }
        })

        if (!actionPlan) return next(createHttpErrors({
            message: "There is no action plan with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (actionPlan.status === 'REJECTED') {
            await prisma.notification.create({
                data: {
                    avatar: emp!.avatar! ?? "",
                    type: "REJECTED_DELETE",
                    content: getNotificationContent(actionPlan.status, actionPlan.criticalEmployee.employee.fullName, "REJECTED_DELETE"),
                    departmentId: actionPlan.departmentId
                }
            })
            await EmailQueue.add("notify-email", {
                customName: `${emp.firstName} ${emp.lastName} | Super Admin`,
                subject: rejected_delete_subject(actionPlan.criticalEmployee.employee.fullName),
                body: rejected_delete_body(actionPlan.criticalEmployee.employee.fullName),
                to: [actionPlan.contact]
            }, {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000
                }
            })
        }

        const delActionPlan = await prisma.actionPlan.delete({
            where: { id }
        })

        res.status(200).json({
            message: "Successfully deleted action plan",
            planId: delActionPlan.id
        })
    }
]

export const updateActionPlan = [
    body("id", "Action Plan Id is required").isString().trim().notEmpty().escape(),
    body("suggestions", "Suggestions is required.").trim().notEmpty(),
    body("status", "Status is required").trim().notEmpty().escape(),
    body("emailType", "Email Type is required").trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        const { id, suggestions, status, emailType } = req.body

        const actionPlan = await prisma.actionPlan.findUnique({
            where: { id },
            select: {
                criticalEmployee: {
                    select: {
                        employee: {
                            select: {
                                fullName: true,
                            }
                        },
                        departmentId: true
                    }
                },
                contact: true,
                type: true,
            }
        })

        if (!actionPlan) return next(createHttpErrors({
            message: "There is no action plan with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (actionPlan.type === 'COMPLETED') return next(createHttpErrors({
            message: "You cannot update completed action plan.",
            status: 400,
            code: errorCodes.invalid
        }))

        await prisma.$transaction(async (tx) => {
            await tx.actionPlan.update({
                where: { id },
                data: {
                    suggestions,
                    status: status as RStatus,
                    type: status === 'REJECTED' ? "FAILED" : "PROCESSING"
                }
            })

            await tx.notification.create({
                data: {
                    avatar: emp!.avatar! ?? "",
                    type: emailType,
                    content: getNotificationContent(status, actionPlan.criticalEmployee.employee.fullName, emailType),
                    departmentId: actionPlan.criticalEmployee.departmentId
                }
            })
        })

        await EmailQueue.add('notify-email', {
            customName: `${emp.firstName} ${emp.lastName} | Super Admin`,
            subject: response_subject(actionPlan.criticalEmployee.employee.fullName, status, emailType),
            body: response_body(actionPlan.criticalEmployee.employee.fullName, status, emailType),
            to: [actionPlan.contact]
        }, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000
            }
        })

        res.status(200).json({
            message: "Successfully updated action plan"
        })
    }
]