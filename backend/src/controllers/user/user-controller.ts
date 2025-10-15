import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import sanitizeHtml from 'sanitize-html'
import { PrismaClient } from "../../../generated/prisma"
import { CRITICAL_POINT } from "../../config"
import { errorCodes } from "../../config/error-codes"
import { CacheQueue } from "../../jobs/queues/cache-queue"
import { EmailQueue } from "../../jobs/queues/email-queue"
import { ScoreQueue, ScoreQueueEvents } from "../../jobs/queues/score-queue"
import { getEmployeeById } from "../../services/auth-services"
import { getAllEmpEmotionHistory } from "../../services/emp-services"
import { authorize } from "../../utils/authorize"
import { getOrSetCache } from "../../utils/cache"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { critical_body, critical_subject, normal_body, normal_subject } from "../../utils/email-templates"
import { calculatePositiveStreak, determineReputation } from "../../utils/helplers"

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
        const emp = await prisma.employee.findUnique({
            where: { id: empId },
            include: {
                checkIns: {
                    select: { emotionScore: true },
                    orderBy: { createdAt: 'desc' },
                    take: 9
                }
            }
        });
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

        const last9Scores = emp!.checkIns.map(e => +e.emotionScore);
        const last10Scores = [+score!, ...last9Scores];

        const isValid = last10Scores.slice(0, 5).every(s => s >= -0.5);

        const positiveStreak = calculatePositiveStreak(last10Scores);

        try {
            //* Calculate avgScore upfront
            const newEmotionSum = +emp!.emotionSum + score!;
            const newEmotionCount = emp!.emotionCount + 1;
            const avgScore = newEmotionSum / newEmotionCount;
            const isCritical = avgScore <= CRITICAL_POINT;
            const isRecovered = emp!.status === 'WATCHLIST' && isValid
            const isNewCritical = avgScore <= CRITICAL_POINT && emp!.status !== "CRITICAL" && emp!.status !== "WATCHLIST"

            const earnedPoints = determineReputation(score!, positiveStreak);

            //* Optimized transaction - only critical DB operations
            await prisma.$transaction(async (tx) => {
                //* Single combined update instead of multiple queries
                const statusUpdate = isRecovered ? "NORMAL" : (isNewCritical ? "CRITICAL" : undefined);

                const updates = await Promise.all([
                    //* 1. Insert emotion check-in
                    tx.emotionCheckIn.create({
                        data: {
                            employeeId: emp!.id,
                            emoji: emoji.trim(),
                            textFeeling: textFeeling.trim(),
                            emotionScore: score!,
                            points: earnedPoints
                        }
                    }),

                    //* 2. Update employee - combined in ONE query
                    tx.employee.update({
                        where: { id: emp!.id },
                        data: {
                            emotionSum: newEmotionSum,
                            emotionCount: newEmotionCount,
                            streak: positiveStreak,
                            avgScore,
                            points: { increment: earnedPoints },
                            ...(statusUpdate && { status: statusUpdate }),
                            ...(isNewCritical && { lastCritical: new Date() })
                        }
                    })
                ]);

                //* 3. Handle status-specific DB operations (only if needed)
                if (isRecovered) {
                    await tx.notification.create({
                        data: {
                            avatar: emp?.avatar!,
                            type: 'NORMAL',
                            content: `🎉 Good news!!!. ${emp?.firstName} ${emp?.lastName} is back to normal. Yay!!!🙌`,
                            department: { connect: { id: emp?.departmentId } }
                        }
                    });
                }

                if (isNewCritical) {
                    await Promise.all([
                        tx.criticalEmployee.create({
                            data: {
                                employee: { connect: { id: emp!.id } },
                                department: { connect: { id: emp!.departmentId } },
                                emotionScore: avgScore,
                            }
                        }),
                        tx.notification.create({
                            data: {
                                avatar: emp?.avatar!,
                                type: 'CRITICAL',
                                content: `${emp?.firstName} ${emp?.lastName}'s sentiments has dropped to critical. Please review.`,
                                department: { connect: { id: emp?.departmentId } }
                            }
                        })
                    ]);
                }

                return { updates, avgScore };
            });

            //* Response immdiately - Don't wait for background tasks
            res.status(200).json({
                message: "Successfully checked in.",
                score,
                isCritical
            });

            //* Move all notifications to background
            setImmediate(async () => {
                try {
                    const bgTasks = [];

                    const adminEmails = await prisma.employee.findMany({
                        where: {
                            departmentId: emp!.departmentId,
                            role: "ADMIN"
                        },
                        select: {
                            email: true
                        }
                    })

                    //* Cache invalidation
                    bgTasks.push(
                        CacheQueue.add("invalidate-emotion-cache", {
                            pattern: "emotion-*"
                        }, {
                            jobId: `invalidate-${Date.now()}`,
                            priority: 1
                        })
                    );

                    //* Email notifications (only if status changed)
                    if (isRecovered) {
                        bgTasks.push(
                            EmailQueue.add("notify-email", {
                                subject: normal_subject(),
                                body: normal_body(`${emp?.firstName} ${emp?.lastName}`),
                                to: adminEmails.map(admin => admin.email)
                            }, {
                                jobId: `email-normal:${emp?.id}:${Date.now()}`
                            })
                        );
                    }

                    if (isNewCritical) {
                        bgTasks.push(
                            EmailQueue.add("notify-email", {
                                subject: critical_subject(`${emp?.firstName} ${emp?.lastName}`),
                                body: critical_body(`${emp?.firstName} ${emp?.lastName}`),
                                to: adminEmails.map(admin => admin.email)
                            }, {
                                jobId: `email-critical:${emp?.id}:${Date.now()}`
                            })
                        );
                    }

                    await Promise.all(bgTasks);
                } catch (bgError) {
                    console.error('Background task error:', bgError);
                }
            });

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

    // const history = await getAllEmpEmotionHistory(emp!.id)
    const cacheKey = `emotion-history-${emp!.id}`
    const history = await getOrSetCache(cacheKey, async () => getAllEmpEmotionHistory(emp!.id))

    res.status(200).json({
        message: `Here is your history. Emp - ${emp!.email}`,
        history
    })
}