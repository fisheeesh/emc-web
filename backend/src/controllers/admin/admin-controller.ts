import { endOfDay, startOfDay, startOfMonth } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { query } from "express-validator";
import { PrismaClient } from "../../../generated/prisma";
import { MOOD_THRESHOLDS } from "../../config";
import { getEmployeeById } from "../../services/auth-services";
import { checkEmployeeIfNotExits } from "../../utils/check";
import { getTodayMoodPercentages } from "../../services/emotion-check-in-services";

const prisma = new PrismaClient()

interface CustomRequest extends Request {
    employeeId?: number
}

export const testAdmin = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "You have permission to access this route"
    })
}
/**
 * * posi -> 0.4 - 1.0, neu -> 0.3 - -0.3, neg -> -0.4 - -0.7, cri -> -0.8 - -1
 */
export const getTodayMoodOverview = [
    query("duration", "Invalid Duration")
        .trim()
        .escape()
        .optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { duration = 'today' } = req.query

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const now = new Date()

        const durationFilter = duration === 'today' ? {
            gte: startOfDay(now),
            lte: endOfDay(now)
        } : {
            gte: startOfMonth(now),
            lte: endOfDay(now)
        }

        const percentages = await getTodayMoodPercentages(emp!.departmentId, durationFilter)

        res.status(200).json({
            message: "Here is Today Mood Overview Data.",
            percentages
        })
    }
]