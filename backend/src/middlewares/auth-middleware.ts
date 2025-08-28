import { NextFunction, Request, Response } from "express";
import { errorCodes } from "../config/error-codes";
import { createHttpErrors } from "../utils/helpers";

import jwt from 'jsonwebtoken';
import { getEmployeeById } from "../services/auth-services";

interface CustomRequest extends Request {
    employeeId?: number
}

export const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
    //* For mobil api calls only
    const platform = req.header('x-platform')
    if (platform === 'mobile') {
        const accessTokenMobile = req.headers.authorization?.split(' ')[1]
        console.log('Request from mobile: ', accessTokenMobile)
    } else {
        console.log('Request from web')
    }

    const accessToken = req.cookies ? req.cookies.accessToken : null
    const refreshToken = req.cookies ? req.cookies.refreshToken : null

    if (!refreshToken) return next(createHttpErrors({
        message: "You are not authenticated employee.",
        status: 401,
        code: errorCodes.unauthenticated
    }))

    const generateNewTokens = async () => {
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { id: number, email: string }
        } catch (error) {
            return next(createHttpErrors({
                message: 'You are not an authenticated user.',
                code: errorCodes.unauthenticated,
                status: 401,
            }))
        }

        if (isNaN(decoded.id)) return next(createHttpErrors({
            message: "You are not authenticated employee.",
            status: 401,
            code: errorCodes.unauthenticated
        }))

        const employee = await getEmployeeById(decoded.id)
        if (!employee) return next(createHttpErrors({
            message: "You are not authenticated employee.",
            status: 401,
            code: errorCodes.unauthenticated
        }))

        if (employee.email !== decoded.email || employee.rndToken !== refreshToken) return next(createHttpErrors({
            message: "You are not authenticated employee.",
            status: 401,
            code: errorCodes.unauthenticated
        }))

        const accessTokenPayload = { id: employee.id }
        const refreshTokenPayload = { id: employee.id, email: employee.email }

        const newAccessToken = jwt.sign(
            accessTokenPayload,
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: 60 * 15 }
        )

        const newRefreshToken = jwt.sign(
            refreshTokenPayload,
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: 60 * 60 * 24 * 30 }
        )

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1000 * 60 * 15,
            path: '/'
        }).cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 30,
            path: '/'
        })

        req.employeeId = employee.id
        next()
    }

    if (!accessToken) {
        generateNewTokens()
    } else {
        let decoded;
        try {
            decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as { id: number }

            if (isNaN(decoded.id)) return next(createHttpErrors({
                message: "You are not authenticated employee.",
                status: 401,
                code: errorCodes.unauthenticated
            }))

            req.employeeId = decoded.id
            next()
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                generateNewTokens()
            } else {
                return next(createHttpErrors({
                    message: 'Access Token is invalid.',
                    code: errorCodes.attack,
                    status: 401,
                }))
            }
        }
    }

}