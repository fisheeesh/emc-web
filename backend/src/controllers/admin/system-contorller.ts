import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { errorCodes } from "../../config/error-codes";
import { createHttpErrors } from "../../utils/check";
import { createOrUpdateSettingStatus } from "../../services/system-service";

interface CustomRequest extends Request {
    userId?: number
}

export const setMaintenance = [
    body("mode", "Mode must be boolean").isBoolean(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { mode } = req.body

        const value = mode ? 'true' : 'false'
        const message = mode ? 'Successfully set Maintenance mode.' : 'Successfully turn off Maintenance mode.'

        await createOrUpdateSettingStatus("maintenance", value)

        res.status(200).json({ message })
    }
]