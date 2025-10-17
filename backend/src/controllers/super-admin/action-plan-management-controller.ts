import { NextFunction, Request, Response } from "express"
import { body, query, validationResult } from "express-validator"
import { Prisma, Priority, RStatus, RType } from "../../../generated/prisma"
import { getAllActionPlansInfinite } from "../../services/action-plan-services"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { errorCodes } from "../../config/error-codes"
import { prisma } from "../../config/prisma-client"
import { EmailQueue } from "../../jobs/queues/email-queue"
import { response_subject, response_body } from "../../utils/email-templates"
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
            where: { id }
        })

        if (!actionPlan) return next(createHttpErrors({
            message: "There is no action plan with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        // const delActionPlan = await prisma.actionPlan.delete({
        //     where: { id }
        // })

        res.status(200).json({
            message: "Successfully deleted action plan"
        })
    }
]

export const updateActionPlan = [
    body("id", "Action Plan Id is required").isString().trim().notEmpty().escape(),
    body("suggestions", "Suggestions is required.").trim().notEmpty(),
    body("status", "Status is required").trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        const { id, suggestions, status } = req.body

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
            }
        })

        if (!actionPlan) return next(createHttpErrors({
            message: "There is no action plan with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        await prisma.$transaction(async (tx) => {
            await tx.actionPlan.update({
                where: { id },
                data: {
                    suggestions,
                    status: status as RStatus
                }
            })

            await tx.notification.create({
                data: {
                    avatar: emp!.avatar! ?? "",
                    type: 'RESPONSE',
                    content: getNotificationContent(status, actionPlan.criticalEmployee.employee.fullName),
                    departmentId: actionPlan.criticalEmployee.departmentId
                }
            })
        })

        await EmailQueue.add('notify-email', {
            subject: response_subject(actionPlan.criticalEmployee.employee.fullName, status),
            body: response_body(actionPlan.criticalEmployee.employee.fullName, status)
        })

        res.status(200).json({
            message: "Successfully updated action plan"
        })
    }
]