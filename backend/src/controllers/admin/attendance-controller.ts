import { endOfDay, endOfMonth, endOfYear, startOfDay, startOfMonth, startOfYear, subDays } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { query } from "express-validator";
import { getEmployeeById } from "../../services/auth-services";
import { getAttendanceOverviewInfiniteData, getCheckInHoursData, getDailyAttendanceData } from "../../services/emotion-check-in-services";
import { checkEmployeeIfNotExits } from "../../utils/check";
import { getEmotionRange } from "../../utils/helplers";

interface CustomRequest extends Request {
    employeeId?: number
}

export const getDailyAttendance = [
    query("dep", "Invalid Department.").trim().escape().optional(),
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
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("duration", "Invalid Date.").trim().optional().escape(),
    query("type", "Invalid Type.").trim().optional().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { duration, type, dep } = req.query
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

        const data = await getCheckInHoursData(emp!.departmentId, dep as string, emp!.role, durationFilter)

        res.status(200).json({
            message: "Here is check in hours.",
            data
        })
    }
]

export const getAttendanceOverView = [
    query("limit", "Limit must be LogId.").isInt({ gt: 6 }).optional(),
    query("cursor", "Cursor must be unsigned integer.").isInt({ gt: 0 }).optional(),
    query("dep", "Invalid Department.").trim().escape().optional(),
    query("kw", "Invalid Keyword.").trim().optional().escape(),
    query("status", "Invalid Status").trim().optional().escape(),
    query("date", "Invalid Date").trim().optional().escape(),
    query("ts", "Invalid Timestamp").trim().optional().escape(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const empId = req.employeeId
        const { limit = 7, cursor: lastCursor, kw, status, date, dep, ts = 'desc' } = req.query

        const emp = await getEmployeeById(empId!)
        checkEmployeeIfNotExits(emp)

        const start = startOfDay(date ? new Date(date as string) : new Date());
        const end = endOfDay(date ? new Date(date as string) : new Date());

        const where: any = {
            createdAt: { gte: start, lte: end },
        };

        const employeeWhere: any = {};

        const deptId =
            emp!.role !== "SUPERADMIN"
                ? emp!.departmentId
                : dep && dep !== "all"
                    ? Number(dep)
                    : undefined;

        if (typeof deptId !== "undefined") {
            employeeWhere.departmentId = deptId;
        }

        employeeWhere.department = {
            isActive: true
        };

        const kwTrimmed = (kw || "").toString().trim();
        if (kwTrimmed.length > 0) {
            const keywords = kwTrimmed.split(/\s+/);
            employeeWhere.AND = keywords.map(word => ({
                OR: [
                    { firstName: { contains: word, mode: "insensitive" } },
                    { lastName: { contains: word, mode: "insensitive" } },
                    { position: { contains: word, mode: "insensitive" } },
                ]
            }));
        }

        if (Object.keys(employeeWhere).length > 0) {
            where.employee = Object.keys(employeeWhere).length === 1 && "department" in employeeWhere
                ? employeeWhere
                : { AND: [employeeWhere] };
        }

        const options: any = {
            take: +limit + 1,
            skip: lastCursor ? 1 : 0,
            cursor: lastCursor ? { id: +lastCursor } : undefined,
            where,
            select: {
                id: true,
                emoji: true,
                textFeeling: true,
                emotionScore: true,
                status: true,
                checkInTime: true,
                employee: {
                    select: {
                        id: true,
                        fullName: true,
                        position: true,
                        jobType: true,
                        avatar: true,
                        recentStreak: true
                    }
                }
            },
            orderBy: {
                updatedAt: ts
            }
        }

        if (typeof status === 'string' && status !== 'all') {
            const emotionRange = getEmotionRange(status.toLowerCase());
            if (emotionRange) {
                options.where.emotionScore = emotionRange;
            }
        }

        const attendances = await getAttendanceOverviewInfiniteData(options)
        const hasNextPage = attendances!.length > +limit

        if (hasNextPage) attendances!.pop()

        const nextCursor = hasNextPage ? attendances![attendances!.length - 1].id : null

        res.status(200).json({
            message: "Here is Attendance OverView Data.",
            hasNextPage,
            nextCursor,
            prevCursor: lastCursor || undefined,
            data: attendances
        })
    }
]
