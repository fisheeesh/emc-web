import { endOfDay, startOfDay, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { errorCodes } from "../../config/error-codes";
import { prisma } from "../../config/prisma-client";
import { AnalysisQueue, AnalysisQueueEvents } from "../../jobs/queues/analysis-queue";
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

        //* Map emotionScore to status for AI analysis
        // const checkInsWithStatus = emotionCheckIns.map(checkIn => ({
        //     textFeeling: checkIn.textFeeling,
        //     emoji: checkIn.emoji,
        //     checkInTime: checkIn.checkInTime,
        //     status: checkIn.status
        // }))

        const employeeName = `${criticalEmp.employee.fullName}`.trim() || "Employee"

        try {
            //* Add job to queue
            const job = await AnalysisQueue.add("generateAnalysis", {
                checkIns: emotionCheckIns,
                employeeName,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                criticalEmpId: criticalEmpId
            })

            //* Wait for the job to finish (with timeout of 30 seconds)
            const result = await job.waitUntilFinished(AnalysisQueueEvents, 30000)

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
