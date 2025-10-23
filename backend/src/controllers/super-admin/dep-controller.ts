import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import { errorCodes } from "../../config/error-codes"
import { prisma } from "../../config/prisma-client"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

export const getAllDepartmentsData = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const emp = req.employee
    checkEmployeeIfNotExits(emp)

    const departments = await prisma.department.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            isActive: true,
            createdAt: true,
            employees: {
                where: {
                    role: "ADMIN"
                },
                select: {
                    fullName: true,
                    email: true,
                }
            },
            _count: {
                select: {
                    criticalEmployees: true,
                    employees: true,
                    actionPlans: true,
                }
            }
        },
        orderBy: {
            employees: {
                _count: 'desc'
            }
        }
    })

    res.status(200).json({
        message: "Here is all departments data",
        data: departments
    })
}

export const createNewDepartment = [
    body("name", "Department name is required").trim().notEmpty().escape(),
    body("description", "Department description is required").trim().notEmpty(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        if (emp.role !== 'SUPERADMIN') return next(createHttpErrors({
            message: "You are not allowed to do this action",
            status: 403,
            code: errorCodes.forbidden
        }))

        const { name, description } = req.body

        const newDep = await prisma.department.create({
            data: { name, description }
        })

        res.status(201).json({
            message: "Successfully created a department",
            depId: newDep.id
        })
    }
]

export const updateDepartmentById = [
    body("id", "Department Id is required").isInt({ gt: 0 }),
    body("name", "Department name is required").trim().optional().escape(),
    body("description", "Department description is required").trim().optional(),
    body("status", "Department Status is required").trim().optional().trim(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        if (emp.role !== 'SUPERADMIN') return next(createHttpErrors({
            message: "You are not allowed to do this action",
            status: 403,
            code: errorCodes.forbidden
        }))

        const { id, name, description, status } = req.body

        const existingDep = await prisma.department.findUnique({
            where: { id }
        })

        if (!existingDep) return next(createHttpErrors({
            message: "Department with provided Id is not existed.",
            status: 404,
            code: errorCodes.notFound
        }))

        const updatedDep = await prisma.department.update({
            where: { id },
            data: {
                name,
                description,
                isActive: status === 'ACTIVE' ? true : false
            }
        })

        res.status(200).json({
            message: `Successfully updated department with ${updatedDep.id}`,
            depId: updatedDep.id
        })
    }
]

export const deleteDepartmentById = [
    body("id", "Department Id is required").isInt({ gt: 0 }),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        if (emp.role !== 'SUPERADMIN') return next(createHttpErrors({
            message: "You are not allowed to do this action",
            status: 401,
            code: errorCodes.unauthorized
        }))

        const { id } = req.body

        const existingDep = await prisma.department.findUnique({
            where: { id },
            select: {
                criticalEmployees: true,
                employees: true,
                actionPlans: true,
                notifications: true,
            }
        })

        if (!existingDep) return next(createHttpErrors({
            message: "Department with provided Id is not existed.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (existingDep.employees.length > 0 ||
            existingDep.criticalEmployees.length > 0 ||
            existingDep.actionPlans.length > 0 ||
            existingDep.notifications.length > 0) {
            return next(createHttpErrors({
                message: "Cannot delete department. Please remove all employees, critical employees, action plans, and notifications first.",
                status: 400,
                code: errorCodes.invalid
            }))
        }

        const delDep = await prisma.department.delete({
            where: { id },
        })

        res.status(200).json({
            message: `Successfully deleted department with ${delDep.id}`,
            depId: delDep.id
        })
    }
]