import { prisma } from "../config/prisma-client"
import { getEmotionRange } from "../utils/helplers"

export const updateEmpDataById = async (id: number, empData: any) => {
    const data: any = {
        firstName: empData.firstName,
        lastName: empData.lastName,
        phone: empData.phone,
        role: empData.role,
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

    return await prisma.employee.findMany(options)
}

export const getEmpLast4daysScores = async (id: number) => {
    const scores = await prisma.emotionCheckIn.findMany({
        where: {
            employeeId: id
        },
        select: {
            emotionScore: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 4
    })

    return scores.map(s => s.emotionScore);
}