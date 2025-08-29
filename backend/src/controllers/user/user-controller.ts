import { NextFunction, Request, Response, text } from "express"
import { body, validationResult } from "express-validator"
import sanitizeHtml from 'sanitize-html'
import { errorCodes } from "../../config/error-codes"
import { ScoreQueue, ScoreQueueEvents } from "../../jobs/queues/score-queue"
import { getEmployeeById, updateEmployeeData } from "../../services/auth-services"
import { authorize } from "../../utils/authorize"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { createEmotionCheckIn, getEmpAverageScore } from "../../services/emotion-services"
import { CRITICAL_POINT } from "../../config/constants"

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

        const data: any = {
            employeeId: emp!.id,
            emoji,
            textFeeling,
            emotionScore: score
        }

        await createEmotionCheckIn(data)

        const avg = await getEmpAverageScore(emp!.id)

        let updatedEmpData;
        const isCritical = avg._avg.emotionScore !== null && Number(avg._avg.emotionScore) <= CRITICAL_POINT
        if (isCritical) {
            /**
             * * emp's status -> cirtical, avgScore, lastCritical
             * * criEmp -> insert
             * * aiAnalyziz -> generate
             */
            updatedEmpData = {
                status: "CRITICAL",
                avgScore: avg._avg.emotionScore
            }
        } else {
            updatedEmpData = {
                avgScore: avg._avg.emotionScore
            }
        }

        await updateEmployeeData(emp!.id, updatedEmpData)

        res.status(200).json({
            message: "Successfully checked in.",
            score,
            isCritical
        })
    }
]