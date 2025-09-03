import { endOfDay, startOfDay, startOfMonth, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { query } from "express-validator";
import { getEmployeeById } from "../../services/auth-services";
import { getSentimentsComparisonData, getTodayMoodPercentages } from "../../services/emotion-check-in-services";
import { getOrSetCache } from "../../utils/cache";
import { checkEmployeeIfNotExits } from "../../utils/check";

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

        const durationFilter = duration === 'today'
            ? {
                gte: startOfDay(now),
                lte: endOfDay(now)
            } : {
                gte: startOfMonth(now),
                lte: endOfDay(now)
            }

        // const percentages = await getTodayMoodPercentages(emp!.departmentId, durationFilter)
        const cacheKey = `sentiments-mood-overview-${JSON.stringify(durationFilter)}`
        const percentages = await getOrSetCache(cacheKey, async () => getTodayMoodPercentages(emp!.departmentId, durationFilter))

        res.status(200).json({
            message: "Here is Today Mood Overview Data.",
            data: percentages
        })
    }
]

export const getSenitmentsComparison = [
    query("duration", "Invalid Duration")
        .trim()
        .escape()
        .optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId;
        const { duration = "7" } = req.query;

        const emp = await getEmployeeById(empId!);
        checkEmployeeIfNotExits(emp);

        const now = new Date();

        const durationFilter =
            duration === "7"
                ? {
                    gte: startOfDay(subDays(now, 6)),
                    lte: endOfDay(now),
                }
                : {
                    gte: startOfDay(subDays(now, 29)),
                    lte: endOfDay(now),
                };

        // const result = await getSentimentsComparisonData(durationFilter, emp!.departmentId);
        const cacheKey = `sentiment-comparison-${JSON.stringify(durationFilter)}`
        const result = await getOrSetCache(cacheKey, async () => getSentimentsComparisonData(durationFilter, emp!.departmentId))

        return res.status(200).json({
            message: "Here is Sentiments Comparison Data.",
            data: result,
        });
    }
]