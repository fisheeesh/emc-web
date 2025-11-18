import { eachDayOfInterval, endOfDay, format, startOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { PrismaClient } from "../../prisma/generated/prisma";
import { prisma } from "../config/prisma-client";
import { departmentFilter, roundToHourLocal } from "../utils/helplers";
import { getSystemSettingsData } from "./system-service";

const prismaClient = new PrismaClient()

export const createEmotionCheckIn = async (emotion: any) => {
    const data = {
        emoji: emotion.emoji,
        textFeeling: emotion.textFeeling,
        emotionScore: emotion.emotionScore,
        employee: {
            connect: { id: emotion.employeeId }
        }
    }

    return await prismaClient.emotionCheckIn.create({
        data
    })
}

export const getMoodPercentages = async (
    uDepartmentId: number,
    qDepartmentId: string,
    role: string,
    durationFilter: any
) => {
    try {
        //* Get ALL check-ins in the duration period
        const checkIns = await prismaClient.emotionCheckIn.findMany({
            where: {
                ...departmentFilter(role, uDepartmentId, qDepartmentId),
                createdAt: durationFilter,
            },
            select: {
                emotionScore: true,
            }
        });

        //* Get system settings to compute scores
        const systemSettings = await getSystemSettingsData();

        let posi = 0, neu = 0, nega = 0, crit = 0;

        //* Count All check-ins in the period
        for (const checkIn of checkIns) {
            const score = Number(checkIn.emotionScore);

            if (score >= systemSettings!.positiveMin) posi++;
            else if (score >= systemSettings!.neutralMin) neu++;
            else if (score >= systemSettings!.negativeMin) nega++;
            else crit++;
        }

        //* Use total check-ins as denominator
        const totalCheckIns = checkIns.length;
        const denom = Math.max(totalCheckIns, 1);

        //* Calculate percentages (should sum to 100%)
        const percentages = [
            ((posi / denom) * 100).toFixed(1),
            ((neu / denom) * 100).toFixed(1),
            ((nega / denom) * 100).toFixed(1),
            ((crit / denom) * 100).toFixed(1),
        ].map(Number);

        return percentages;
    } catch (error) {
        return error;
    }
};

export const getSentimentsComparisonData = async (
    uDepartmentId: number,
    qDepartmentId: string,
    role: string,
    start: Date,
    end: Date,
    timezone: string = 'UTC'
) => {
    try {
        const checkIns = await prismaClient.emotionCheckIn.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                },
                ...departmentFilter(role, uDepartmentId, qDepartmentId)
            },
            select: {
                emotionScore: true,
                createdAt: true
            }
        });

        const systemSettings = await getSystemSettingsData();
        const dayMap: Record<
            string,
            { positive: number, neutral: number, negative: number, critical: number }
        > = {};

        for (const entry of checkIns) {
            //* Convert to user's timezone
            const zonedDate = toZonedTime(entry.createdAt, timezone);
            const checkInDate = format(zonedDate, "MMM dd");

            if (!dayMap[checkInDate]) {
                dayMap[checkInDate] = {
                    positive: 0,
                    neutral: 0,
                    negative: 0,
                    critical: 0
                };
            }

            const score = Number(entry.emotionScore);

            if (score >= systemSettings!.positiveMin) dayMap[checkInDate].positive++;
            else if (score >= systemSettings!.neutralMin) dayMap[checkInDate].neutral++;
            else if (score >= systemSettings!.negativeMin) dayMap[checkInDate].negative++;
            else dayMap[checkInDate].critical++;
        }

        //* Generate days in user's timezone
        const zonedStart = toZonedTime(start, timezone);
        const zonedEnd = toZonedTime(end, timezone);
        const days = eachDayOfInterval({ start: zonedStart, end: zonedEnd });

        const result = days.map(day => {
            const key = format(day, "MMM dd");
            return {
                checkInDate: key,
                positive: dayMap[key]?.positive ?? 0,
                neutral: dayMap[key]?.neutral ?? 0,
                negative: dayMap[key]?.negative ?? 0,
                critical: dayMap[key]?.critical ?? 0
            };
        });

        return result;
    } catch (error) {
        return error;
    }
};

interface DailyAttendanceData {
    totalEmp: number,
    totalPresent: number,
    result: any,
    percentages: any
}

export const getDailyAttendanceData = async (
    uDepartmentId: number,
    qDepartmentId: string,
    role: string,
    start: Date,
    end: Date,
    timezone: string = 'UTC'
): Promise<DailyAttendanceData> => {
    try {
        const totalEmp = await prismaClient.employee.count({
            where: {
                department: {
                    isActive: true,
                },
                departmentId:
                    role !== 'SUPERADMIN'
                        ? uDepartmentId
                        : qDepartmentId && qDepartmentId !== 'all'
                            ? Number(qDepartmentId)
                            : undefined
            }
        });

        const totalPresent = await prismaClient.emotionCheckIn.count({
            where: {
                createdAt: {
                    gte: startOfDay(new Date()),
                    lte: endOfDay(new Date())
                },
                ...departmentFilter(role, uDepartmentId, qDepartmentId)
            }
        });

        const checkIns = await prismaClient.emotionCheckIn.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lte: end
                },
                ...departmentFilter(role, uDepartmentId, qDepartmentId)
            },
            select: {
                createdAt: true
            }
        });

        const dayMap: Record<string, { value: number }> = {};

        for (const entry of checkIns) {
            //* Convert UTC to user's timezone
            const zonedDate = toZonedTime(entry.createdAt, timezone);
            const checkInDate = format(zonedDate, "MMM dd");

            if (!dayMap[checkInDate]) dayMap[checkInDate] = { value: 1 };
            else dayMap[checkInDate].value++;
        }

        //* Generate days in user's timezone
        const zonedStart = toZonedTime(start, timezone);
        const zonedEnd = toZonedTime(end, timezone);
        const days = eachDayOfInterval({ start: zonedStart, end: zonedEnd });

        const result = days.map(day => {
            const key = format(day, "MMM dd");
            return {
                checkInDate: key,
                value: dayMap[key]?.value ?? 0
            };
        });

        const percentages = result.map(data => ({
            ...data,
            value: +((data.value / Math.max(totalEmp, 1) * 100)).toFixed(2)
        }));

        return {
            totalEmp,
            totalPresent,
            result,
            percentages
        };
    } catch (error) {
        return {
            totalEmp: 0,
            totalPresent: 0,
            result: [],
            percentages: []
        };
    }
};

export const getCheckInHoursData = async (
    uDepartmentId: number,
    qDepartmentId: string,
    role: string,
    durationFilter: any,
    timezone: string = 'UTC'
) => {
    try {
        const checkIns = await prismaClient.emotionCheckIn.findMany({
            where: {
                createdAt: durationFilter,
                ...departmentFilter(role, uDepartmentId, qDepartmentId)
            },
            select: {
                createdAt: true
            }
        });

        const hourOrders = Array.from({ length: 24 }, (_, i) => {
            return `${String(i).padStart(2, '0')}:00`;
        });

        const counts = new Map(hourOrders.map(h => [h, 0]));

        for (const { createdAt } of checkIns) {
            //* Convert to user's timezone
            const zonedDate = toZonedTime(createdAt, timezone);
            const bucket = roundToHourLocal(zonedDate);
            counts.set(bucket, (counts.get(bucket) || 0) + 1);
        }

        const result = hourOrders.map(checkInHour => ({
            checkInHour,
            value: counts.get(checkInHour)
        }));

        return result;
    } catch (error) {
        console.log(error);
    }
};

export const getAttendanceOverviewInfiniteData = async (options: any) => {
    try {
        return await prisma.emotionCheckIn.findMany(options)
    } catch (error) {
        console.log(error)
    }
}