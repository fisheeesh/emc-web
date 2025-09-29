import { endOfDay, endOfMonth, endOfYear, startOfDay, startOfMonth, startOfYear, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { query } from "express-validator";
import { PrismaClient } from "../../../generated/prisma";
import { getAdminUserData } from "../../services/admin-services";
import { getEmployeeById } from "../../services/auth-services";
import { getAttendanceOverviewData, getCheckInHoursData, getDailyAttendanceData, getMoodPercentages, getSentimentsComparisonData } from "../../services/emotion-check-in-services";
import { getAllDepartmentsData } from "../../services/system-service";
import { checkEmployeeIfNotExits } from "../../utils/check";

interface CustomRequest extends Request {
    employeeId?: number
}

const prismaClient = new PrismaClient()

export const testAdmin = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "You have permission to access this route"
    })
}

export const getMoodOverview = [
    query("dep", "Invalid Department.")
        .trim()
        .escape()
        .optional(),
    query("duration", "Invalid Duration")
        .trim()
        .escape()
        .optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { duration = 'today', dep } = req.query

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

        const percentages = await getMoodPercentages(emp!.departmentId, dep as string, emp!.role, durationFilter)
        // const cacheKey = `emotion-mood-overview-${JSON.stringify(durationFilter)}`
        // const percentages = await getOrSetCache(cacheKey, async () => getTodayMoodPercentages(emp!.departmentId, durationFilter))

        res.status(200).json({
            message: "Here is Today Mood Overview Data.",
            data: percentages
        })
    }
]

export const getSenitmentsComparison = [
    query("dep", "Invalid Department.")
        .trim()
        .escape()
        .optional(),
    query("duration", "Invalid Duration")
        .trim()
        .escape()
        .optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId;
        const { duration = "7", dep } = req.query;

        const emp = await getEmployeeById(empId!);
        checkEmployeeIfNotExits(emp);

        const now = new Date();

        const start = startOfDay(subDays(now, duration === '7' ? 6 : 29))
        const end = endOfDay(now)

        const result = await getSentimentsComparisonData(emp!.departmentId, dep as string, emp!.role, start, end);
        // const cacheKey = `emotion-comparison-${JSON.stringify(durationFilter)}`
        // const result = await getOrSetCache(cacheKey, async () => getSentimentsComparisonData(durationFilter, emp!.departmentId))

        return res.status(200).json({
            message: "Here is Sentiments Comparison Data.",
            data: result,
        });
    }
]

export const getDailyAttendance = [
    query("dep", "Invalid Department.")
        .trim()
        .escape()
        .optional(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const { dep } = req.query

        const start = startOfDay(subDays(new Date(), 9))
        const end = endOfDay(new Date())

        const { totalEmp, totalPresent, result, percentages } = await getDailyAttendanceData(emp!.departmentId, dep as string, emp!.role, start, end)

        res.status(200).json({
            message: "Here is daily attendance.",
            totalEmp,
            totalPresent,
            data: result,
            percentages
        })
    }
]

export const getCheckInHours = [
    query("duration", "Invalid Date.")
        .trim()
        .optional()
        .escape(),
    query("type", "Invalid Type.")
        .trim()
        .optional()
        .escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { duration, type } = req.query
        const empId = req.employeeId
        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const durationFilter =
            type === 'day' ? {
                gte: startOfDay(new Date(duration as string)),
                lte: endOfDay(new Date(duration as string))
            } : type === 'month' ? {
                gte: startOfMonth(new Date(duration as string)),
                lte: endOfMonth(new Date(duration as string))
            } : type === 'year' ? {
                gte: startOfYear(new Date(duration as string)),
                lte: endOfYear(new Date(duration as string))
            } : {
                gte: startOfDay(new Date()),
                lte: endOfDay(new Date())
            }

        const data = await getCheckInHoursData(emp!.departmentId, durationFilter)

        res.status(200).json({
            message: "Here is check in hours.",
            data
        })
    }
]

export const getAttendanceOverView = [
    query("empName", "Invalid Name.")
        .trim()
        .optional()
        .escape(),
    query("status", "Invalid Status")
        .trim()
        .optional()
        .escape(),
    query("date", "Invalid Date")
        .trim()
        .optional()
        .escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { empName, status, date } = req.query

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const result = await getAttendanceOverviewData(emp!.departmentId, empName as string, status as string, date as string)

        res.status(200).json({
            message: "Here is Attendance OverView Data.",
            data: result
        })
    }
]

export const getAllDepartments = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const result = await getAllDepartmentsData()

    res.status(200).json({
        message: "Here is All Departments Data.",
        data: result
    })
}

export const getAdminUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId
    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    const result = await getAdminUserData(emp!.id)

    res.status(200).json({
        message: "Here is Admin User Data.",
        data: result
    })
}
