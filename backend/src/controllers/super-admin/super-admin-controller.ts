import { NextFunction, Request, Response } from "express"

interface CustomRequest extends Request {
    employeeId?: number
    employee?: any
}

export const testSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "You have permission to access this route"
    })
}
