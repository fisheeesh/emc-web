import { startOfDay, addDays, eachDayOfInterval, format } from "date-fns"
import { PrismaClient } from "../../generated/prisma"
import { prisma } from "../config/prisma-client"

const prismaClient = new PrismaClient()

export const createCriticalEmp = async (empId: number, avgScore: number) => {
    return await prismaClient.$transaction(async (tx) => {
        await tx.employee.update({
            where: { id: empId },
            data: {
                status: "CRITICAL",
                lastCritical: new Date(),
                avgScore
            }
        })
    })
}

export const getAllCriticalInfinite = async (options: any) => {
    return await prisma.criticalEmployee.findMany(options)
}

export const getAllWatchlistInfinite = async (options: any) => {
    const watchlistEmps = await prisma.employee.findMany(options);

    //* Transform employees to include emotion tracking
    const transformedEmps = watchlistEmps.map((emp: any) => {
        const actionPlan = emp.criticalTimes?.[0]?.actionPlan;
        let emotionHistory: any[] = [];

        if (actionPlan?.updatedAt && emp.checkIns) {
            // *Get the updatedAt date
            const actionUpdatedDate = new Date(actionPlan.updatedAt);

            //* Filter check-ins that happened AFTER the action plan was updated
            const checkInsAfterAction = emp.checkIns
                .filter((checkIn: any) => {
                    const checkInDate = new Date(checkIn.createdAt);
                    return checkInDate > actionUpdatedDate;
                })
                .sort((a: any, b: any) => {
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                });

            //* Take the first 4 check-ins after the action plan
            const trackingCheckIns = checkInsAfterAction.slice(0, 4);

            //* Map to emotion data format
            emotionHistory = trackingCheckIns.map((checkIn: any) => {
                const checkInDate = new Date(checkIn.createdAt);
                return {
                    date: format(checkInDate, 'MMM d'),
                    emotion: checkIn.status,
                    value: checkIn.emotionScore
                };
            });
        }

        return {
            ...emp,
            emotionHistory
        };
    });

    return transformedEmps;
}