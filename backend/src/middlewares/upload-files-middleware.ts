import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

//* Image file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//* Cloudinary storage for employee images
const fileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'employees/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }],
        public_id: (req: any, file: Express.Multer.File) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `avatar-${uniqueSuffix}`;
        }
    } as any
});

const upload = multer({
    storage: fileStorage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 }
});

export const uploadMemory = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 }
});

//* CSV file filter 
const csvFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/csv' ||
        file.mimetype === 'text/plain'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only CSV files are allowed!') as any, false);
    }
};

//* Multer configuration for CSV uploads
export const uploadCSV = multer({
    storage: multer.memoryStorage(),
    fileFilter: csvFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
});

//* Attachment file filter for email attachments
const attachmentFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not supported for attachments!') as any, false);
    }
};

//* Cloudinary storage for attachments
const attachmentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'employees/attachments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'],
        resource_type: 'auto',
        public_id: (req: any, file: Express.Multer.File) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const originalName = file.originalname.split('.')[0];
            return `${originalName}-${uniqueSuffix}`;
        }
    } as any
});

//* Multer configuration for email attachments
export const uploadAttachments = multer({
    storage: attachmentStorage,
    fileFilter: attachmentFileFilter,
    limits: { fileSize: 1024 * 1024 * 10 }
});

export default upload;