import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import sanitizeHtml from 'sanitize-html'
import { PrismaClient } from "../../../generated/prisma"
import { CRITICAL_POINT } from "../../config/constants"
import { errorCodes } from "../../config/error-codes"
import { ScoreQueue, ScoreQueueEvents } from "../../jobs/queues/score-queue"
import { getEmployeeById } from "../../services/auth-services"
import { authorize } from "../../utils/authorize"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { AnalysisQueue, AnalysisQueueEvents } from "../../jobs/queues/analysis-queue"

const prisma = new PrismaClient()

interface CustomRequest extends Request {
    employeeId?: number
}

export const test = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const employeeId = req.employeeId
    const employee = await getEmployeeById(employeeId!)
    checkEmployeeIfNotExits(employee)

    const info: any = {
        title: 'Test Permission',
    }

    const can = authorize(true, employee!.role, "ADMIN")
    if (can) {
        info.content = "You have permission to access this route"
    }

    res.status(200).json(info)
}

export const emotionCheckIn = [
    body("moodMessage", "Moode Message is required.")
        .trim()
        .notEmpty()
        .customSanitizer(value => sanitizeHtml(value)).notEmpty(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { moodMessage } = req.body
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const [emoji, textFeeling] = moodMessage.split(',')

        const job = await ScoreQueue.add("calculate-score", {
            moodMessage
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        })

        //* the full response from model
        const raw = await job.waitUntilFinished(ScoreQueueEvents)
        //* find last number in string
        const match = raw.match(/-?\d+(\.\d+)?$/);
        const score = match ? parseFloat(match[0]) : null;

        try {
            const isCritical = await prisma.$transaction(async (tx) => {
                //* Insert emotion check-in
                await tx.emotionCheckIn.create({
                    data: {
                        employeeId: emp!.id,
                        emoji: emoji.trim(),
                        textFeeling: textFeeling.trim(),
                        emotionScore: +score!
                    }
                })

                //* Update employee running totals
                const updatedEmp = await tx.employee.update({
                    where: { id: emp!.id },
                    data: {
                        emotionSum: { increment: +score! },
                        emotionCount: { increment: 1 }
                    }
                })

                //* Calculate new avgScore
                const avgScore = (+updatedEmp.emotionSum + 0) / (updatedEmp.emotionCount + 0)

                //* Update avgScore field
                await tx.employee.update({
                    where: { id: emp!.id },
                    data: { avgScore }
                })

                //* Critical check AFTER update
                const isCritical = avgScore <= CRITICAL_POINT
                if (isCritical) {
                    await tx.employee.update({
                        where: { id: emp!.id },
                        data: {
                            status: "CRITICAL",
                            lastCritical: new Date()
                        }
                    })

                    const critEmp = await tx.criticalEmployee.create({
                        data: {
                            employee: {
                                connect: { id: emp!.id }
                            },
                            status: "CRITICAL",
                            emotionScore: avgScore,
                        }
                    })

                    const emotions = await tx.emotionCheckIn.findMany({
                        where: { employeeId: emp!.id },
                        select: {
                            textFeeling: true,
                            emoji: true,
                        },
                        take: 7
                    })

                    const input = emotions.flatMap((e) => [e.emoji, e.textFeeling]).join(' ')

                    const job = await AnalysisQueue.add("analysis-emotion", {
                        input
                    }, {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 1000
                        }
                    })

                    const raw = await job.waitUntilFinished(AnalysisQueueEvents)
                    console.log(raw)

                    await tx.aIAnalysis.create({
                        data: {
                            input,
                            output: "",
                            critical: {
                                connect: { id: critEmp.id }
                            }
                        }
                    })
                }

                return isCritical
            })

            res.status(200).json({
                message: "Successfully checked in.",
                score,
                isCritical
            })
        } catch (err: any) {
            return next(createHttpErrors({
                message: err.message,
                status: 500,
                code: errorCodes.server
            }))
        }
    }
]