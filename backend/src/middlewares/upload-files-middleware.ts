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

//* Image filte filter
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

export default upload