import { NextFunction, Request, Response } from "express"
import { body, query, validationResult } from "express-validator"
import { errorCodes } from "../../config/error-codes"
import { prisma } from "../../config/prisma-client"
import { getEmployeeByEmail, getEmployeeById, getOTPRowByEmail } from "../../services/auth-services"
import { getSystemSettingsData } from "../../services/system-service"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { generateHashedValue, generateToken } from "../../utils/generate"

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

            //* Build where clause only active dep
            const whereClause: any = {
                accType: 'ACTIVE'
            };

            //* If departmentId is provided, filter by it and ensure department is active
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

            //* Overall Wellbeing Score
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

            //* Critical Alerts only from active dep
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

            //* Check-in Rate -> employees who checked in today vs total active employees
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

            //* Positive Emotion Rate (emotions >= 0.4 this month)
            const settings = await getSystemSettingsData()
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
                .filter(item => Number(item.emotionScore) >= settings!.positiveMin)
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
                .filter(item => Number(item.emotionScore) >= settings!.positiveMin)
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

export const getEmotions = [
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const categories = await prisma.emotionCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                emotions: {
                    orderBy: { order: 'asc' },
                    select: {
                        icon: true,
                        label: true,
                    },
                },
            },
        });

        const data = categories.map(category => ({
            title: category.title,
            emotions: category.emotions,
        }));

        res.status(200).json({
            message: "Emotion categories retrieved successfully",
            data,
        });
    }
];

export const createEmotion = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isIn(['Negative', 'Neutral', 'Positive'])
        .withMessage("Title must be either 'Negative', 'Neutral', or 'Positive'"),

    body("emotions")
        .isArray({ min: 9, max: 9 })
        .withMessage("Emotions must be an array with exactly 9 items"),

    body("emotions.*.icon")
        .trim()
        .notEmpty()
        .withMessage("Each emotion must have an icon"),

    body("emotions.*.label")
        .trim()
        .notEmpty()
        .withMessage("Each emotion must have a label")
        .isLength({ min: 1, max: 50 })
        .withMessage("Label must be between 1 and 50 characters"),

    async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req).array({ onlyFirstError: true });
            if (errors.length > 0) return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))

            const { title, emotions } = req.body;

            const existingCategory = await prisma.emotionCategory.findUnique({
                where: { title },
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: `Category '${title}' already exists. Use update instead.`,
                });
            }

            const orderMap: Record<string, number> = {
                'Negative': 1,
                'Neutral': 2,
                'Positive': 3,
            };

            await prisma.$transaction(async (tx) => {
                const newCategory = await tx.emotionCategory.create({
                    data: {
                        title,
                        order: orderMap[title],
                    },
                });

                const emotionPromises = emotions.map((emotion: any, index: number) => {
                    return tx.emotion.create({
                        data: {
                            icon: emotion.icon.trim(),
                            label: emotion.label.trim().toLowerCase(),
                            order: index,
                            categoryId: newCategory.id,
                        },
                    });
                });

                await Promise.all(emotionPromises);
            });

            res.status(201).json({
                message: "Emotion category created successfully",
            });
        } catch (error: any) {
            console.error('Error creating emotion category:', error);

            if (error.code === 'P2002') {
                return res.status(400).json({
                    message: "Duplicate emotion label detected within the category",
                });
            }

            res.status(500).json({
                message: "Failed to create emotion category",
            });
        }
    }
];

export const updateEmotion = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isIn(['Negative', 'Neutral', 'Positive'])
        .withMessage("Title must be either 'Negative', 'Neutral', or 'Positive'"),
    body("emotions")
        .isArray({ min: 9, max: 9 })
        .withMessage("Emotions must be an array with exactly 9 items"),
    body("emotions.*.icon")
        .trim()
        .notEmpty()
        .withMessage("Each emotion must have an icon"),
    body("emotions.*.label")
        .trim()
        .notEmpty()
        .withMessage("Each emotion must have a label")
        .isLength({ min: 1, max: 50 })
        .withMessage("Label must be between 1 and 50 characters"),

    async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req).array({ onlyFirstError: true });
            if (errors.length > 0) return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))

            const { title, emotions } = req.body;

            //* Check if category exists
            const existingCategory = await prisma.emotionCategory.findUnique({
                where: { title },
                include: { emotions: true },
            });

            if (!existingCategory) {
                return res.status(404).json({
                    message: `Category '${title}' not found`,
                });
            }

            await prisma.$transaction(async (tx) => {
                await tx.emotion.deleteMany({
                    where: { categoryId: existingCategory!.id },
                });

                const emotionPromises = emotions.map((emotion: any, index: number) => {
                    return tx.emotion.create({
                        data: {
                            icon: emotion.icon.trim(),
                            label: emotion.label.trim().toLowerCase(),
                            order: index,
                            categoryId: existingCategory!.id,
                        },
                    });
                });

                await Promise.all(emotionPromises);
            });

            res.status(200).json({
                message: "Emotion category updated successfully",
            });
        } catch (error: any) {
            console.error('Error updating emotion category:', error);

            if (error.code === 'P2002') {
                return res.status(400).json({
                    message: "Duplicate emotion label detected within the category",
                });
            }

            res.status(500).json({
                message: "Failed to update emotion category",
            });
        }
    }
];

export const editEmpCredentials = [
    body("editType", "Edit Type is required.").trim().notEmpty().escape(),
    body("id", "EmpId is required.").isInt({ gt: 0 }),
    body("email")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage("Invalid email format."),
    body("password", "Password must meet all requirements.")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
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

        const { id, editType, email, password } = req.body

        const existingEmp = await getEmployeeById(+id)

        if (!existingEmp) return next(createHttpErrors({
            message: "Employee with provided Id is not found",
            status: 404,
            code: errorCodes.notFound
        }))

        const otpRow = await getOTPRowByEmail(existingEmp.email)

        let empData: any = {}
        if (editType === 'email') {
            const existingEmail = await getEmployeeByEmail(email)

            if (existingEmail) return next(createHttpErrors({
                message: "Employee with provided email has been registered. Try another one",
                status: 400,
                code: errorCodes.invalid
            }))

            empData.email = email
        } else {
            const hashedPassword = await generateHashedValue(password)
            empData.password = hashedPassword
        }

        const otp = 123456
        const hashedOTP = await generateHashedValue(otp.toString())
        const otpData = {
            email,
            otp: hashedOTP,
            rememberToken: generateToken(),
            count: 1
        }

        await prisma.$transaction(async (tx) => {
            await tx.employee.update({
                where: { id },
                data: empData
            })

            if (editType === 'email') {
                if (!otpRow) await tx.otp.create({ data: otpData })
                else await tx.otp.update({
                    where: { email: existingEmp.email },
                    data: otpData
                })
            }
        })

        res.status(200).json({
            message: "Successfully updated employee credentials"
        })
    }
]

export const getSystemSettings = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const emp = req.employee
    checkEmployeeIfNotExits(emp)

    const settings = await getSystemSettingsData()

    res.status(200).json({
        message: "Here is system settings.",
        data: settings
    })
}

export const updateSettings = [
    body("watchlistTrackMin")
        .notEmpty().withMessage("Watchlist Track Minimum is required.")
        .isInt({ min: 14, max: 365 }).withMessage("Watchlist Track Minimum must be an integer between 14 and 365."),

    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const emp = req.employee
        checkEmployeeIfNotExits(emp)

        const { watchlistTrackMin } = req.body

        try {
            await prisma.setting.update({
                where: { id: 1 },
                data: {
                    watchlistTrackMin
                }
            })

            res.status(200).json({
                message: "Successfully updated system settings."
            })
        } catch (error: any) {
            console.error("Error updating settings:", error)
            return next(createHttpErrors({
                message: "Failed to update settings. Please try again.",
                status: 500,
                code: errorCodes.server
            }))
        }
    }
]
