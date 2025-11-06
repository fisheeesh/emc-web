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
import axios from 'axios';
import fs from 'fs';
import cloudinary from "../../config/cloudinary";

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

        if (notification.departmentId !== emp?.departmentId && emp!.role !== 'SUPERADMIN') return next(createHttpErrors({
            message: "You are not allowed to delete another department's notification",
            status: 403,
            code: errorCodes.forbidden
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

        let attachments: Array<{ filename: string; content: string }> | undefined;

        if (req.files && req.files.length > 0) {
            const files = req.files as any[];

            //* Read files and convert to base64 immediately
            attachments = await Promise.all(files.map(async (file) => {
                let base64Content: string;

                //* Check if file has Cloudinary metadata (production)
                if (file.path.startsWith('http://') || file.path.startsWith('https://')) {
                    try {
                        //* Option 1: Try to use public_id from multer-storage-cloudinary
                        const publicId = file.filename;

                        console.log(`Attempting to download Cloudinary file with public_id: ${publicId}`);

                        //* Use Cloudinary Admin API to get the resource as base64
                        const result = await cloudinary.api.resource(publicId, {
                            resource_type: 'raw',
                            type: 'upload'
                        });

                        //* Download the secure_url with authentication
                        const response = await axios.get(result.secure_url, {
                            responseType: 'arraybuffer',
                            headers: {
                                'User-Agent': 'Mozilla/5.0'
                            },
                            timeout: 30000
                        });

                        base64Content = Buffer.from(response.data).toString('base64');
                        console.log(`Successfully downloaded from Cloudinary: ${file.originalname}`);
                    } catch (error: any) {
                        console.error(`Failed to download attachment: ${file.path}`, error.message);

                        //* If all else fails, try direct axios download (will fail if ACL restricted)
                        try {
                            const response = await axios.get(file.path, {
                                responseType: 'arraybuffer',
                                timeout: 30000
                            });
                            base64Content = Buffer.from(response.data).toString('base64');
                            console.log(`Downloaded via direct URL: ${file.originalname}`);
                        } catch (directError) {
                            console.error(`All download attempts failed for: ${file.path}`);
                            throw new Error(`Unable to download attachment ${file.originalname}. Please check Cloudinary permissions.`);
                        }
                    }
                } else {
                    //* Read local file (development)
                    const fileBuffer = fs.readFileSync(file.path);
                    base64Content = fileBuffer.toString('base64');

                    //* Delete local file immediately after reading
                    try {
                        fs.unlinkSync(file.path);
                        console.log(`Deleted local file: ${file.path}`);
                    } catch (err) {
                        console.error(`Failed to delete local file: ${file.path}`, err);
                    }
                }

                return {
                    filename: file.originalname,
                    content: base64Content
                };
            }));
        }

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


