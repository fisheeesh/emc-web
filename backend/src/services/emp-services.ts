import { eachDayOfInterval, format, getHours, getMinutes, startOfDay, subDays } from "date-fns"
import jwt from 'jsonwebtoken'
import { PrismaClient } from "../../generated/prisma"
import { prisma } from "../config/prisma-client"
import { getEmotionRange } from "../utils/helplers"

const prismaClient = new PrismaClient()

export const createEmployeeWithOTP = async (empData: any, otpData: any) => {
    return await prismaClient.$transaction(async (tx) => {
        const data = {
            ...empData,
            department: {
                connectOrCreate: {
                    where: { name: empData.department },
                    create: { name: empData.department }
                }
            }
        }
        const newEmp = await tx.employee.create({ data })

        await tx.otp.create({
            data: otpData
        })

        const refreshTokenPayload = { id: newEmp.id, email: newEmp.email, role: newEmp.role }

        const refreshToken = jwt.sign(
            refreshTokenPayload,
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: "30d" }
        )

        await tx.employee.update({
            where: { id: newEmp.id },
            data: { rndToken: refreshToken }
        })

        return newEmp
    })
}

export const updateEmpDataById = async (id: number, empData: any) => {
    const data: any = {
        firstName: empData.firstName,
        lastName: empData.lastName,
        phone: empData.phone,
        role: empData.role,
        country: empData.country,
        birthdate: empData.birthdate,
        workStyle: empData.workStyle,
        gender: empData.gender,
        position: empData.position,
        jobType: empData.jobType,
        accType: empData.accType,
    }

    if (empData.department) {
        data.department = {
            connectOrCreate: {
                where: { name: empData.department },
                create: { name: empData.department }
            }
        }
    }

    if (empData.avatar) {
        data.avatar = empData.avatar
    }
    return await prisma.employee.update({
        where: { id },
        data
    })
}

export const getAllEmpEmotionHistory = async (employeeId: number) => {
    return await prisma.emotionCheckIn.findMany({
        where: { employeeId },
        select: {
            emoji: true,
            textFeeling: true,
            emotionScore: true,
            createdAt: true,
            employee: {
                select: {
                    fullName: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    })
}

export const deleteEmployeeById = async (id: number) => {
    return await prisma.$transaction(async (tx) => {
        const deletedUser = await tx.employee.delete({
            where: { id }
        })

        await tx.otp.deleteMany({
            where: { email: deletedUser.email }
        })

        return deletedUser
    })
}

export const getEmployeesInfiniteData = async (options: any, status: string) => {
    if (typeof status === 'string' && status !== 'all') {
        const emotionRange = getEmotionRange(status.toLowerCase());
        if (emotionRange) {
            options.where.avgScore = emotionRange;
        }
    }

    const emps = await prisma.employee.findMany(options);

    //* Generate last 10 days interval for emotion tracking
    const last10Days = eachDayOfInterval({
        start: startOfDay(subDays(new Date(), 9)),
        end: startOfDay(new Date())
    });

    const modifiedEmps = emps.map((emp: any) => {
        //* Create a map of check-ins for last 10 days
        const checkInMap = new Map();

        emp.checkIns?.forEach((checkIn: any) => {
            const checkInDate = new Date(checkIn.createdAt);
            const dateKey = format(startOfDay(checkInDate), 'yyyy-MM-dd');

            //* Store the check-in with short date format
            if (!checkInMap.has(dateKey)) {
                checkInMap.set(dateKey, {
                    date: format(checkInDate, 'MMM d'),
                    emotion: checkIn.status
                });
            }
        });

        //* Map each day in the interval to either existing check-in or null
        const formattedCheckIns = last10Days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            return checkInMap.get(dateKey) || {
                date: format(day, 'MMM d'),
                emotion: "neutral"
            };
        });

        //* Work Schedule Analysis - Last 30 days
        const last30DaysStart = startOfDay(subDays(new Date(), 29));
        const last30DaysCheckIns = emp.checkIns?.filter((checkIn: any) => {
            const checkInDate = new Date(checkIn.createdAt);
            return checkInDate >= last30DaysStart;
        }) || [];

        //* Group check-ins by hour slots (0-23 hours in 24-hour format)
        const timeSlotCounts: Record<string, number> = {};

        //* Initialize all 24 hour slots
        for (let hour = 0; hour < 24; hour++) {
            const startHour = hour.toString().padStart(2, '0');
            const endHour = ((hour + 1) % 24).toString().padStart(2, '0');
            timeSlotCounts[`${startHour}:00-${endHour}:00`] = 0;
        }

        const checkInTimes: Date[] = [];

        last30DaysCheckIns.forEach((checkIn: any) => {
            const checkInDate = new Date(checkIn.createdAt);
            checkInTimes.push(checkInDate);
            const hour = getHours(checkInDate);

            const startHour = hour.toString().padStart(2, '0');
            const endHour = ((hour + 1) % 24).toString().padStart(2, '0');
            const slotKey = `${startHour}:00-${endHour}:00`;

            if (timeSlotCounts[slotKey] !== undefined) {
                timeSlotCounts[slotKey]++;
            }
        });

        //* Convert to array format
        const attendanceData = Object.entries(timeSlotCounts).map(([timeSlot, count]) => ({
            timeSlot,
            count
        }));

        //* Calculate statistics
        let averageCheckIn = "N/A";
        let earliestCheckIn = "N/A";
        let latestCheckIn = "N/A";
        let mostCommonTime = "N/A";

        if (checkInTimes.length > 0) {
            //* Sort times
            checkInTimes.sort((a, b) => a.getTime() - b.getTime());

            //* Earliest check-in
            earliestCheckIn = format(checkInTimes[0], 'h:mm a');

            //* Latest check-in
            latestCheckIn = format(checkInTimes[checkInTimes.length - 1], 'h:mm a');

            //* Average check-in time
            const totalMinutes = checkInTimes.reduce((sum, time) => {
                return sum + getHours(time) * 60 + getMinutes(time);
            }, 0);
            const avgMinutes = Math.round(totalMinutes / checkInTimes.length);
            const avgHours = Math.floor(avgMinutes / 60);
            const avgMins = avgMinutes % 60;
            averageCheckIn = format(new Date().setHours(avgHours, avgMins, 0), 'h:mm a');

            //* Most common time slot
            const maxSlot = Object.entries(timeSlotCounts).reduce((max, [slot, count]) => {
                return count > max.count ? { slot, count } : max;
            }, { slot: "", count: 0 });

            if (maxSlot.count > 0) {
                mostCommonTime = maxSlot.slot;
            }
        }

        return {
            ...emp,
            checkIns: formattedCheckIns,
            workSchedule: {
                attendanceData,
                averageCheckIn,
                earliestCheckIn,
                latestCheckIn,
                mostCommonTime,
                totalCheckIns: last30DaysCheckIns.length
            }
        };
    });

    return modifiedEmps;
}