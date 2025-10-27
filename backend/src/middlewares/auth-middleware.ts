import { NextFunction, Request, Response } from "express";
import { errorCodes } from "../config/error-codes";
import { createHttpErrors } from "../utils/check";

import jwt from 'jsonwebtoken';
import { getEmployeeById } from "../services/auth-services";
import { cookieConfig } from "../config/cookies.config";

interface CustomRequest extends Request {
    employeeId?: number
}

export const auth = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const platform = req.header("x-platform");

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (platform === "mobile") {
        //* For mobile → tokens come from headers
        accessToken = req.headers.authorization?.split(" ")[1] || null;
        refreshToken = req.header("x-refresh-token") || null;
    } else {
        //* For web → tokens come from cookies
        accessToken = req.cookies?.accessToken || null;
        refreshToken = req.cookies?.refreshToken || null;
    }

    if (!refreshToken) return next(createHttpErrors({
        message: "You are not authenticated employee.",
        status: 401,
        code: errorCodes.unauthenticated
    }))

    const generateNewTokens = async () => {
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { id: number, email: string, role: string }
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

        if (!employee || employee.email !== decoded.email || employee.rndToken !== refreshToken || employee.role !== decoded.role) return next(createHttpErrors({
            message: "You are not authenticated employee.",
            status: 401,
            code: errorCodes.unauthenticated
        }))

        const accessTokenPayload = { id: employee.id }
        const refreshTokenPayload = { id: employee.id, email: employee.email, role: employee.role }

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

        if (platform === "mobile") {
            //* return JSON tokens to mobile
            res.setHeader("x-access-token", newAccessToken);
            res.setHeader("x-refresh-token", newRefreshToken);
        } else {
            res.cookie("accessToken", accessToken, cookieConfig.accessToken)
                .cookie("refreshToken", refreshToken, cookieConfig.refreshToken)
        }

        console.log("rotation done")

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