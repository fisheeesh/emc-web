import { PrismaClient } from "../../generated/prisma"
import { prisma } from "../config/prisma-client"
import { getEmotionRange } from "../utils/helplers"
import jwt from 'jsonwebtoken'

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