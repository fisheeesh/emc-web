import { NextFunction, Request, Response } from "express"
import { body, query, validationResult } from "express-validator"
import { errorCodes } from "../../config/error-codes"
import { prisma } from "../../config/prisma-client"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

export const testSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "You have permission to access this route"
    })
}

export const getSummaryData = [
    query("dep", "Invalid Department.").trim().escape().optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const departmentId = req.query.dep ? parseInt(req.query.dep as string) : undefined;

            //* Date range for current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

            //* Build where clause - ONLY ACTIVE EMPLOYEES
            const whereClause: any = {
                accType: 'ACTIVE'
            };

            //* If departmentId is provided, filter by it (and ensure department is active)
            if (departmentId) {
                whereClause.departmentId = departmentId;
                whereClause.department = {
                    isActive: true
                };
            } else {
                //* If no specific department, only include employees from active departments
                whereClause.department = {
                    isActive: true
                };
            }

            //* Overall Wellbeing Score (avgScore average)
            const wellbeingData = await prisma.employee.aggregate({
                where: whereClause,
                _avg: {
                    avgScore: true
                }
            });

            const lastMonthWellbeingData = await prisma.employee.aggregate({
                where: {
                    ...whereClause,
                    updatedAt: {
                        gte: startOfLastMonth,
                        lte: endOfLastMonth
                    }
                },
                _avg: {
                    avgScore: true
                }
            });

            const currentWellbeing = wellbeingData._avg.avgScore || 0;
            const lastMonthWellbeing = lastMonthWellbeingData._avg.avgScore || currentWellbeing;
            const wellbeingChange = +lastMonthWellbeing > 0
                ? ((Number(currentWellbeing) - Number(lastMonthWellbeing)) / Number(lastMonthWellbeing) * 100)
                : 0;

            //* Critical Alerts (unresolved critical employees) - ONLY FROM ACTIVE DEPARTMENTS
            const criticalWhere: any = {
                isResolved: false,
                department: {
                    isActive: true
                }
            };

            if (departmentId) {
                criticalWhere.departmentId = departmentId;
            }

            const criticalAlerts = await prisma.criticalEmployee.count({
                where: criticalWhere
            });

            const lastMonthCriticalAlerts = await prisma.criticalEmployee.count({
                where: {
                    ...criticalWhere,
                    createdAt: {
                        gte: startOfLastMonth,
                        lte: endOfLastMonth
                    }
                }
            });

            const criticalChange = criticalAlerts - lastMonthCriticalAlerts;

            //* Count resolved this month only from active dep
            const resolvedThisMonth = await prisma.criticalEmployee.count({
                where: {
                    ...(departmentId ? { departmentId } : {}),
                    isResolved: true,
                    resolvedAt: {
                        gte: startOfMonth
                    },
                    department: {
                        isActive: true
                    }
                }
            });

            //* Check-in Rate (employees who checked in today vs total active employees)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const totalEmployees = await prisma.employee.count({
                where: whereClause
            });

            const checkedInToday = await prisma.emotionCheckIn.count({
                where: {
                    createdAt: {
                        gte: today
                    },
                    employee: whereClause
                }
            });

            const checkInRate = totalEmployees > 0
                ? (checkedInToday / totalEmployees * 100)
                : 0;

            //? Last month check-in rate
            const lastMonthDays = endOfLastMonth.getDate();
            const lastMonthCheckIns = await prisma.emotionCheckIn.count({
                where: {
                    createdAt: {
                        gte: startOfLastMonth,
                        lte: endOfLastMonth
                    },
                    employee: whereClause
                }
            });

            const lastMonthEmployees = await prisma.employee.count({
                where: {
                    ...whereClause,
                    createdAt: {
                        lte: endOfLastMonth
                    }
                }
            });

            const lastMonthCheckInRate = (lastMonthEmployees * lastMonthDays) > 0
                ? (lastMonthCheckIns / (lastMonthEmployees * lastMonthDays) * 100)
                : 0;

            const checkInRateChange = lastMonthCheckInRate > 0
                ? ((checkInRate - lastMonthCheckInRate) / lastMonthCheckInRate * 100)
                : 0;

            //* Positive Emotion Rate (emotions >= 0 this month)
            // Emotion scores are between -1 and 1
            // Positive/Neutral: >= 0
            // Negative: < 0
            const thisMonthEmotions = await prisma.emotionCheckIn.groupBy({
                by: ['emotionScore'],
                where: {
                    createdAt: {
                        gte: startOfMonth
                    },
                    employee: whereClause
                },
                _count: true
            });

            const totalEmotionsThisMonth = thisMonthEmotions.reduce((sum, item) => sum + item._count, 0);
            const positiveEmotionsThisMonth = thisMonthEmotions
                .filter(item => Number(item.emotionScore) >= 0.3)
                .reduce((sum, item) => sum + item._count, 0);

            const positiveRate = totalEmotionsThisMonth > 0
                ? (positiveEmotionsThisMonth / totalEmotionsThisMonth * 100)
                : 0;

            //* Last month positive rate
            const lastMonthEmotions = await prisma.emotionCheckIn.groupBy({
                by: ['emotionScore'],
                where: {
                    createdAt: {
                        gte: startOfLastMonth,
                        lte: endOfLastMonth
                    },
                    employee: whereClause
                },
                _count: true
            });

            const totalEmotionsLastMonth = lastMonthEmotions.reduce((sum, item) => sum + item._count, 0);
            const positiveEmotionsLastMonth = lastMonthEmotions
                .filter(item => Number(item.emotionScore) >= 0.3)
                .reduce((sum, item) => sum + item._count, 0);

            const lastMonthPositiveRate = totalEmotionsLastMonth > 0
                ? (positiveEmotionsLastMonth / totalEmotionsLastMonth * 100)
                : 0;

            const positiveRateChange = lastMonthPositiveRate > 0
                ? ((positiveRate - lastMonthPositiveRate) / lastMonthPositiveRate * 100)
                : 0;

            res.status(200).json({
                message: "Here is summary data",
                data: {
                    wellbeing: {
                        score: Number(currentWellbeing).toFixed(2),
                        maxScore: 1.0,
                        change: Number(wellbeingChange.toFixed(1)),
                        trend: wellbeingChange >= 0 ? 'up' : 'down'
                    },
                    criticalAlerts: {
                        count: criticalAlerts,
                        change: criticalChange,
                        resolvedThisMonth: resolvedThisMonth,
                        trend: criticalChange <= 0 ? 'down' : 'up'
                    },
                    checkInRate: {
                        rate: Number(checkInRate.toFixed(1)),
                        change: Number(checkInRateChange.toFixed(1)),
                        trend: checkInRateChange >= 0 ? 'up' : 'down'
                    },
                    positiveRate: {
                        rate: Number(positiveRate.toFixed(1)),
                        change: Number(positiveRateChange.toFixed(1)),
                        trend: positiveRateChange >= 0 ? 'up' : 'down'
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
]

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