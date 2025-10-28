import { endOfDay, startOfDay, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { errorCodes } from "../../config/error-codes";
import { prisma } from "../../config/prisma-client";
import { generateAIAnalysisData, genereateAIRecommendationData } from "../../services/ai-services";
import { getEmployeeById } from "../../services/auth-services";
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check";

interface CustomRequest extends Request {
    employeeId?: number
}

export const generateAIAnalysis = [
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
                    select: {
                        fullName: true
                    }
                },
                analysis: true
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
        if (criticalEmp.analysis) {
            return next(createHttpErrors({
                message: "AI Analysis already exists for this critical employee instance.",
                status: 400,
                code: errorCodes.invalid
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
                status: true
            },
            orderBy: {
                createdAt: "asc"
            }
        })

        if (emotionCheckIns.length === 0) {
            return next(createHttpErrors({
                message: "No emotional check-in data found for the specified period.",
                status: 404,
                code: errorCodes.notFound
            }))
        }

        const employeeName = `${criticalEmp.employee.fullName}`.trim() || "Employee"

        try {
            const result = await generateAIAnalysisData({
                checkIns: emotionCheckIns,
                employeeName,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                criticalEmpId: criticalEmpId
            })

            res.status(200).json({
                message: "AI Analysis generated successfully",
                data: result
            })
        } catch (error: any) {
            console.error("AI Analysis generation error:", error)

            return next(createHttpErrors({
                message: error.message || "Failed to generate AI analysis. Please try again.",
                status: 500,
                code: errorCodes.server
            }))
        }
    }
]

export const regenerateAIAnalysis = [
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

        //* Find and delete existing analysis for the critical employee instance
        const existingAnalysis = await prisma.aIAnalysis.findUnique({
            where: { criticalId: criticalEmpId },
            select: {
                id: true,
                critical: {
                    select: {
                        actionPlan: {
                            select: { id: true }
                        }
                    }
                }
            }
        })

        if (!existingAnalysis) return next(createHttpErrors({
            message: "No existing AI analysis found to regenerate.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (existingAnalysis && existingAnalysis.critical.actionPlan) return next(createHttpErrors({
            message: "Cannot regenerate analysis as an action plan has already been created for this critical employee instance.",
            status: 400,
            code: errorCodes.invalid
        }))

        await prisma.aIAnalysis.delete({
            where: { id: existingAnalysis.id }
        })

        //* Proceed to generate new analysis
        req.body.criticalEmpId = criticalEmpId
        return generateAIAnalysis[1](req, res, next)
    }
]

export const generateAIRecommendation = [
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
            const result = await genereateAIRecommendationData({
                empName: criticalEmp.employee.fullName,
                emotionCheckIns: emotionCheckIns.map(checkIn => ({
                    ...checkIn,
                    checkInTime: new Date(checkIn.checkInTime)
                }))
            })

            //* Return the generated markdown directly
            res.status(200).json({
                success: true,
                message: "AI recommendation generated successfully",
                data: result
            })

        } catch (error: any) {
            console.error("Error generating AI recommendation:", error)

            if (error.message?.includes('timeout')) {
                return next(createHttpErrors({
                    message: "AI recommendation generation is taking longer than expected. Please try again.",
                    status: 408,
                    code: errorCodes.timeout
                }))
            }

            return next(createHttpErrors({
                message: "Failed to generate AI recommendation. Please try again.",
                status: 500,
                code: errorCodes.server
            }))
        }
    }
]
