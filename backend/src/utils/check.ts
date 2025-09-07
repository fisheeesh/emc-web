import { errorCodes } from "../config/error-codes"

export const createHttpErrors = ({ message, status, code }: {
    message: string,
    status: number,
    code: string
}) => {
    const error: any = new Error()
    error.message = message
    error.status = status
    error.code = code
    return error
}

export const checkEmployeeIfNotExits = (emp: any) => {
    if (!emp) {
        const error: any = new Error('This email has not been registered.')
        error.status = 401
        error.code = errorCodes.unauthenticated
        throw error
    }
}

export const checkEmployeeIfExits = (emp: any) => {
    if (emp) {
        const error: any = new Error("This email has been registered.")
        error.status = 400
        error.code = errorCodes.invalid
        throw error
    }
}

export const checkModelIfExits = (model: any) => {
    if (!model) {
        const error: any = new Error("Model not found.")
        error.status = 404
        error.code = errorCodes.notFound
        throw error
    }
}

export const checkOTPErrorIfSameDate = (isSameDate: boolean, errorCount: number) => {
    if (isSameDate && errorCount >= 5) {
        const error: any = new Error(
            "OTP is wrong for 5 times. Please try again tomorrow."
        )
        error.status = 401
        error.code = errorCodes.overLimit
        throw error
    }
}

export const checkOTPRow = (otpRow: any) => {
    if (!otpRow) {
        const error: any = new Error('Email address is incorrect.')
        error.status = 400
        error.code = errorCodes.invalid
        throw error
    }
}

export const checkUploadFile = (file: any) => {
    if (!file) {
        const error: any = new Error('Invalid image format.')
        error.status = 409
        error.code = errorCodes.invalid
        throw error
    }
}