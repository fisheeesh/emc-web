import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import sanitizeHtml from 'sanitize-html'
import { PrismaClient } from "../../../generated/prisma"
import { CRITICAL_POINT } from "../../config"
import { errorCodes } from "../../config/error-codes"
import { ScoreQueue, ScoreQueueEvents } from "../../jobs/queues/score-queue"
import { getEmployeeById } from "../../services/auth-services"
import { authorize } from "../../utils/authorize"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { getAllEmpEmotionHistory } from "../../utils/user-services"

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

    res.status(200).json({
        info,
        empId: employee!.id
    })
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

        //* Recieve emp's today mood message
        const { moodMessage } = req.body
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        //* Split emoji and text for db schema format
        const [emoji, textFeeling] = moodMessage.split(',')

        //* Let Ai to calculate score
        const job = await ScoreQueue.add("calculate-score", {
            moodMessage
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        })

        const raw = await job.waitUntilFinished(ScoreQueueEvents)
        //* Find last number in string
        const match = raw.match(/-?\d+(\.\d+)?$/);
        //* Get the score and format it
        const score = match ? parseFloat(match[0]) : null;

        try {
            //* Since this is atomic opeartion -> transaction
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

                //* Update employee running totals **without avgScore** for precision
                const updatedEmp = await tx.employee.update({
                    where: { id: emp!.id },
                    data: {
                        emotionSum: { increment: +score! },
                        emotionCount: { increment: 1 },
                    }
                })

                //* Calculate avgScore with up-to-date data
                const avgScore = +updatedEmp.emotionSum / +updatedEmp.emotionCount;

                //* Update avgScore field -> fresh
                await tx.employee.update({
                    where: { id: emp!.id },
                    data: { avgScore }
                })

                //* Critical check AFTER update
                const isCritical = avgScore <= CRITICAL_POINT
                if (isCritical && updatedEmp.status !== "CRITICAL") {
                    await tx.employee.update({
                        where: { id: emp!.id },
                        data: {
                            status: "CRITICAL",
                            lastCritical: new Date()
                        }
                    })

                    await tx.criticalEmployee.create({
                        data: {
                            employee: {
                                connect: { id: emp!.id }
                            },
                            status: "CRITICAL",
                            emotionScore: avgScore,
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

export const getEmpCheckInHistory = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const history = await getAllEmpEmotionHistory(emp!.id)

    res.status(200).json({
        message: `Here is your history. Emp - ${emp!.email}`,
        history
    })
}