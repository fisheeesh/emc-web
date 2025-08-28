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

export const checkEmployeeIfNotExits = (user: any) => {
    if (!user) {
        const error: any = new Error('This email has not been registered.')
        error.status = 401
        error.code = errorCodes.unauthenticated
        throw error
    }
}