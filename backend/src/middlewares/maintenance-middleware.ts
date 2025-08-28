import { NextFunction, Request, Response } from "express";
import { getSettingStatus } from "../services/system-service";
import { createHttpErrors } from "../utils/check";
import { errorCodes } from "../config/error-codes";

const whiteLists = ["127.0.0.1"]

export const maintenance = async (req: Request, res: Response, next: NextFunction) => {
    const ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress

    if (whiteLists.includes(ip)) {
        console.log(`Allowed IP: ${ip}`)
        next()
    } else {
        console.log(`Not Allowed IP: ${ip}`)

        const setting = await getSettingStatus("maintenance")
        if (setting?.value === 'true') {
            return next(createHttpErrors({
                message: "The server is under maintenance. Please try again later.",
                code: errorCodes.maintenance,
                status: 503
            }))
        }

        next()
    }
}