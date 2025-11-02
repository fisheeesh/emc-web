import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import sanitizeHtml from 'sanitize-html'
import { Gender, NotifType, PrismaClient, Status } from "../../..//prisma/generated/prisma"
import { errorCodes } from "../../config/error-codes"
import { CacheQueue } from "../../jobs/queues/cache-queue"
import { EmailQueue } from "../../jobs/queues/email-queue"
import { calculateEmotionScoreWithAI } from "../../services/ai-services"
import { getEmployeeById } from "../../services/auth-services"
import { getAllEmpEmotionHistory, updateEmpDataById } from "../../services/emp-services"
import { getEmployeeEmails, getSystemSettingsData } from "../../services/system-service"
import { authorize } from "../../utils/authorize"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/check"
import { critical_body, critical_subject, normal_body, normal_subject } from "../../utils/email-templates"
import { calculatePositiveStreak } from "../../utils/helplers"
import { prisma } from "../../config/prisma-client"
import cloudinary from "../../config/cloudinary"

const prismaClient = new PrismaClient()

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
    body("moodMessage", "Mood Message is required.")
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

        //* Receive emp's today mood message
        const { moodMessage } = req.body
        const empId = req.employeeId
        const emp = await prismaClient.employee.findUnique({
            where: { id: empId },
            include: {
                checkIns: {
                    select: { emotionScore: true },
                    orderBy: { createdAt: 'desc' },
                    take: 100
                }
            }
        });
        checkEmployeeIfNotExits(emp)

        const systemSettings = await getSystemSettingsData()

        //* Split emoji and text for db schema format
        const [emoji, textFeeling] = moodMessage.split('//')

        //* Let AI calculate score
        const score = await calculateEmotionScoreWithAI(moodMessage, {
            positiveMin: systemSettings!.positiveMin,
            positiveMax: systemSettings!.positiveMax,
            neutralMin: systemSettings!.neutralMin,
            neutralMax: systemSettings!.neutralMax,
            negativeMin: systemSettings!.negativeMin,
            negativeMax: systemSettings!.negativeMax,
            criticalMin: systemSettings!.criticalMin,
            criticalMax: systemSettings!.criticalMax,
        })

        if (score === null) {
            return next(createHttpErrors({
                message: "Failed to parse emotion score from AI response.",
                status: 500,
                code: errorCodes.server
            }))
        }

        const trackWindow = systemSettings!.watchlistTrackMin;
        const previousScores = emp!.checkIns.slice(0, trackWindow - 1).map(e => +e.emotionScore);
        const recentScoresWithCurrent = [+score!, ...previousScores];

        const isValid = recentScoresWithCurrent.every(s => s >= systemSettings!.neutralMin);

        //* Calculate current streak from all recent check-ins
        const allRecentScores = [+score!, ...emp!.checkIns.map(e => +e.emotionScore)];
        const currentStreak = calculatePositiveStreak(allRecentScores, systemSettings!.positiveMin);

        const sureCritical = recentScoresWithCurrent.length >= 5 && recentScoresWithCurrent.slice(0, 5).every(s => s >= systemSettings!.criticalMin)

        //* Calculate avgScore upfront
        const newEmotionSum = +emp!.emotionSum + score!;
        const newEmotionCount = emp!.emotionCount + 1;
        const avgScore = newEmotionSum / newEmotionCount;
        const isRecovered = emp!.status === Status.WATCHLIST && isValid
        const isNewCritical = avgScore >= systemSettings!.criticalMin && sureCritical && emp!.status !== Status.CRITICAL && emp!.status !== Status.WATCHLIST

        //* Update longestStreak if current is better
        const newLongestStreak = Math.max(emp!.longestStreak || 0, currentStreak);

        //* Optimized transaction - only critical DB operations
        await prismaClient.$transaction(async (tx) => {
            //* Single combined update instead of multiple queries
            const statusUpdate = isRecovered ? Status.NORMAL : (isNewCritical ? Status.CRITICAL : undefined);

            const updates = await Promise.all([
                //* 1. Insert emotion check-in
                tx.emotionCheckIn.create({
                    data: {
                        employeeId: emp!.id,
                        emoji: emoji.split("(")[0].trim(),
                        textFeeling: textFeeling.trim(),
                        emotionScore: score!,
                    }
                }),

                //* 2. Update employee - combined in ONE query
                tx.employee.update({
                    where: { id: emp!.id },
                    data: {
                        emotionSum: newEmotionSum,
                        emotionCount: newEmotionCount,
                        longestStreak: newLongestStreak,
                        recentStreak: currentStreak,
                        avgScore,
                        ...(statusUpdate && { status: statusUpdate }),
                        ...(isNewCritical && { lastCritical: new Date() })
                    }
                })
            ]);

            //* 3. Handle status-specific DB operations (only if needed)
            if (isRecovered) {
                await tx.notification.create({
                    data: {
                        avatar: emp!.avatar! ?? "",
                        type: NotifType.NORMAL,
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
                            avatar: emp!.avatar! ?? "",
                            type: NotifType.CRITICAL,
                            content: `${emp?.firstName} ${emp?.lastName}'s sentiments has dropped to critical. Please review.`,
                            department: { connect: { id: emp?.departmentId } }
                        }
                    })
                ]);
            }

            return { updates, avgScore };
        });

        //* Response immediately, dun wait for background tasks
        res.status(200).json({
            message: "Successfully checked in.",
            currentStreak: currentStreak,
            longestStreak: newLongestStreak,
        });

        //* Move all notifications to background
        setImmediate(async () => {
            try {
                const bgTasks = [];

                const adminEmails = await getEmployeeEmails({ departmentId: emp!.departmentId, role: 'ADMIN' })

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
                            to: adminEmails
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
                            to: adminEmails
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
    }
]

export const getEmpCheckInHistory = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const history = await getAllEmpEmotionHistory(emp!.id)
    // const cacheKey = `emotion-history-${emp!.id}`
    // const history = await getOrSetCache(cacheKey, async () => getAllEmpEmotionHistory(emp!.id))

    res.status(200).json({
        message: `Here is your history. Emp - ${emp!.email}`,
        data: history
    })
}

export const getEmployeeData = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)

    checkEmployeeIfNotExits(emp)

    const empData = await prisma.employee.findUnique({
        where: { id: empId },
        select: {
            id: true,
            fullName: true,
            email: true,
            gender: true,
            workStyle: true,
            jobType: true,
            position: true,
            avatar: true,
            birthdate: true,
            phone: true,
            firstName: true,
            lastName: true,
            department: {
                select: {
                    name: true,
                }
            },
            createdAt: true,
        }
    })

    res.status(200).json({
        message: "Here is employee data",
        data: empData
    })
}

export const updateEmployeeDataById = [
    body("id", "EmpId is required.").isInt({ gt: 0 }),
    body("firstName", "First Name is required.").trim().notEmpty().escape(),
    body("lastName", "Last Name is required.").trim().notEmpty().escape(),
    body("phone", "Invalid phone number.").trim().notEmpty().matches(/^[\d]+$/).isLength({ min: 5, max: 12 }),
    body("gender", "Gender is required.").trim().notEmpty().escape()
        .custom(value => {
            if (!Object.values(Gender).includes(value as Gender)) {
                throw new Error("Invalid Gender.")
            }
            return true
        }),
    body("birthdate", "Birth Date is required.").trim().notEmpty().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) {
            if (req.file) {
                try {
                    await cloudinary.uploader.destroy((req.file as any).filename);
                } catch (error) {
                    console.error('Error deleting file from Cloudinary:', error);
                }
            }
            return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))
        }

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)

        if (!emp) {
            if (req.file) {
                try {
                    await cloudinary.uploader.destroy((req.file as any).filename);
                } catch (error) {
                    console.error('Error deleting file from Cloudinary:', error);
                }
            }
            return next(createHttpErrors({
                message: "Employee not found.",
                status: 404,
                code: errorCodes.notFound
            }))
        }

        const { id, firstName, lastName, phone, gender, birthdate } = req.body

        if (Number(emp.id) !== Number(id)) {
            if (req.file) {
                try {
                    await cloudinary.uploader.destroy((req.file as any).filename);
                } catch (error) {
                    console.error('Error deleting file from Cloudinary:', error);
                }
            }
            return next(createHttpErrors({
                message: "You are not allowed to edit other employee data",
                status: 403,
                code: errorCodes.forbidden
            }))
        }

        const data: any = {
            firstName,
            lastName,
            phone,
            gender,
            birthdate,
            avatar: req.file
        }

        if (req.file) {
            //* Store the new Cloudinary URL and public_id
            data.avatar = (req.file as any).path;
            data.avatarPublicId = (req.file as any).filename;

            //* Delete the old image from Cloudinary if it exists
            if (emp.avatarPublicId) {
                try {
                    await cloudinary.uploader.destroy(emp.avatarPublicId);
                    console.log('Old avatar deleted from Cloudinary:', emp.avatarPublicId);
                } catch (error) {
                    console.error('Error deleting old avatar from Cloudinary:', error);
                }
            }
        }

        const updatedEmp = await updateEmpDataById(+id, data)

        res.status(200).json({
            message: "Employee data updated successfully.",
            empId: updatedEmp.id
        })
    }
]