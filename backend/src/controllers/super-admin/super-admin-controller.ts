import { NextFunction, Request, Response } from "express"
import { query } from "express-validator"
import { prisma } from "../../config/prisma-client"

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

            //* Build where clause
            const whereClause: any = {};

            //* If departmentId is provided, filter by it
            if (departmentId) {
                whereClause.departmentId = departmentId;
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

            //* Critical Alerts (unresolved critical employees)
            const criticalWhere: any = {
                isResolved: false
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

            // Count resolved this month
            const resolvedThisMonth = await prisma.criticalEmployee.count({
                where: {
                    ...(departmentId ? { departmentId } : {}),
                    isResolved: true,
                    resolvedAt: {
                        gte: startOfMonth
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