import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images')
    },
    filename: function (req, file, cb) {
        const ext = file.mimetype.split('/')[1]
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext
        cb(null, uniqueSuffix)
    }
})

//* Image file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: fileStorage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 }
})

export const uploadMemory = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 }
})

//* CSV file filter 
const csvFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/csv' ||
        file.mimetype === 'text/plain'
    ) {
        cb(null, true)
    } else {
        cb(new Error('Only CSV files are allowed!') as any, false)
    }
}

//* Multer configuration for CSV uploads
export const uploadCSV = multer({
    storage: multer.memoryStorage(),
    fileFilter: csvFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }
})

//* Attachment file filter for email attachments such as images, pdfs, docs, etc...
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
}

const attachmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/attachments')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop()
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + ext
        cb(null, uniqueSuffix)
    }
})

//* Multer configuration for email attachments
export const uploadAttachments = multer({
    storage: attachmentStorage,
    fileFilter: attachmentFileFilter,
    limits: { fileSize: 1024 * 1024 * 10 }
})

export default upload