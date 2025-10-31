import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { errorCodes } from "../../config/error-codes";
import { prisma } from "../../config/prisma-client";
import { EmailQueue } from "../../jobs/queues/email-queue";
import { getAdminUserData } from "../../services/admin-services";
import { getEmployeeById } from "../../services/auth-services";
import { getAllDepartmentsData, getEmployeeEmails } from "../../services/system-service";
import { checkEmployeeIfNotExits, checkUploadFile, createHttpErrors } from "../../utils/check";
import { removeFilesMultiple } from "../../utils/helplers";
import { NotiStatus } from "../../../prisma/generated/prisma";

/**
 * @TODO: if all the emotion thredsolds will be changed...
 * * has to adjust score calculation prompt and getEmotion from range func
 */

interface CustomRequest extends Request {
    employeeId?: number,
    files?: any
}

export const testAdmin = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    //* Critical & Normal
    const adminEmails = await getEmployeeEmails({ departmentId: 1, role: 'ADMIN' })
    //* Action plans
    const superAdminEmails = await getEmployeeEmails({ role: "SUPERADMIN" })
    //* Email marketings by admin
    const allEmails = await getEmployeeEmails({ departmentId: 1, excludeEmployeeId: empId!, excludeSuperAdmins: true })
    //* Email marketings by super-admin
    const AllEmails = await getEmployeeEmails({ excludeSuperAdmins: true })

    res.status(200).json({
        message: "You have permission to access this route",
        adminEmails,
        superAdminEmails,
        allEmails,
        AllEmails
    })
}

export const getAllDepartments = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const result = await getAllDepartmentsData()

    res.status(200).json({
        message: "Here is All Departments Data.",
        data: result
    })
}

export const getAdminUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const result = await getAdminUserData(emp!.id)

    res.status(200).json({
        message: "Here is Admin User Data.",
        data: result
    })
}

export const getAllNotifications = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId

    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const isSAdmin = emp!.role === 'SUPERADMIN'

    const results = await prisma.notification.findMany({
        where: isSAdmin
            ? { toSAdmin: true }
            : {
                departmentId: emp!.departmentId,
                toSAdmin: false
            },
        orderBy: {
            createdAt: 'desc'
        }
    })

    res.status(200).json({
        message: "Here is all notifications",
        data: results
    })
}

export const markAsReadNotification = [
    body("id", "Notification Id is required").isInt().toInt(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { id } = req.body

        const notification = await prisma.notification.findUnique({
            where: { id: Number(id) }
        })

        if (!notification) return next(createHttpErrors({
            message: "There is no notification with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        await prisma.notification.update({
            where: { id: Number(id) },
            data: {
                status: NotiStatus.READ
            }
        })

        res.status(200).json({
            message: "Successfully marked as read notification"
        })
    }
]

export const deleteNotification = [
    body("id", "Notification Id is required").isInt().toInt(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { id } = req.body

        const notification = await prisma.notification.findUnique({
            where: { id: Number(id) }
        })

        if (!notification) return next(createHttpErrors({
            message: "There is no notification with provided Id.",
            status: 404,
            code: errorCodes.notFound
        }))

        if (notification.departmentId !== emp?.departmentId) return next(createHttpErrors({
            message: "You are not allowed to delete another department's notification",
            status: 401,
            code: errorCodes.unauthorized
        }))

        await prisma.notification.delete({
            where: { id: Number(id) }
        })

        res.status(200).json({
            message: "Successfully delete a notification"
        })
    }
]

export const makeAnnouncement = [
    body("subject", "Email Subject is required.").trim().notEmpty(),
    body("body", "Email Body is required.").trim().notEmpty(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) {
            if (req.files && req.files.length > 0) {
                const originalFiles = req.files.map((file: any) => file.filename)
                await removeFilesMultiple(originalFiles, null)
            }
            return next(createHttpErrors({
                message: errors[0].msg,
                status: 400,
                code: errorCodes.invalid
            }))
        }
        const empId = req.employeeId
        const emp = await prisma.employee.findUnique({
            where: { id: empId },
            select: {
                fullName: true,
                departmentId: true,
                role: true,
                department: { select: { name: true } }
            }
        })
        checkEmployeeIfNotExits(emp)

        const { subject, body } = req.body;
        if (req.files && req.files.length > 0) checkUploadFile(req.files && req.files.length > 0)

        let emails: string[] = []

        if (emp?.role === 'ADMIN') emails = await getEmployeeEmails({ departmentId: emp.departmentId, excludeEmployeeId: empId!, excludeSuperAdmins: true })
        if (emp?.role === 'SUPERADMIN') emails = await getEmployeeEmails({ excludeSuperAdmins: true })

        if (emails.length === 0) return next(createHttpErrors({
            message: "There is no employee in database right now.",
            status: 400,
            code: errorCodes.invalid
        }))

        const attachments = req.files && req.files.length > 0
            ? (req.files as Express.Multer.File[]).map(file => ({
                filename: file.originalname,
                path: file.path,
                contentType: file.mimetype
            }))
            : undefined;

        await EmailQueue.add("announcement-email", {
            customName: `${emp!.fullName} | ${emp!.department.name}`,
            subject,
            body,
            to: emails,
            isMarkdown: true,
            attachments
        });

        return res.status(200).json({
            message: `Announcement has been made successfully.`,
        });
    }
]


