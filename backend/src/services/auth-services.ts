import { PrismaClient } from "../../generated/prisma";
import jwt from 'jsonwebtoken'

const prismaClient = new PrismaClient()

export const getEmployeeByEmail = async (email: string) => {
    return await prismaClient.employee.findUnique({
        where: { email }
    })
}

export const getEmployeeById = async (id: number) => {
    return await prismaClient.employee.findUnique({
        where: { id }
    })
}

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

export const createEmployee = async (empData: any) => {
    const data = {
        ...empData,
        department: {
            connectOrCreate: {
                where: { name: empData.department },
                create: { name: empData.department }
            }
        }
    }
    return await prismaClient.employee.create({
        data
    })
}

export const updateEmployeeData = async (id: number, data: any) => {
    return await prismaClient.employee.update({
        where: { id },
        data
    })
}

export const getOTPRowByEmail = async (email: string) => {
    return await prismaClient.otp.findUnique({
        where: { email }
    })
}

export const createOTP = async (data: any) => {
    return await prismaClient.otp.create({
        data
    })
}

export const updateOTP = async (id: number, data: any) => {
    return await prismaClient.otp.update({
        where: { id },
        data
    })
}