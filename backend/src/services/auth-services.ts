import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient()

export const getEmployeeByEmail = async (email: string) => {
    return await prisma.employee.findUnique({
        where: { email }
    })
}

export const getEmployeeById = async (id: number) => {
    return await prisma.employee.findUnique({
        where: { id }
    })
}

export const updateEmployeeData = async (id: number, data: any) => {
    return await prisma.employee.update({
        where: { id },
        data
    })
}

export const getOTPRowByEmail = async (email: string) => {
    return await prisma.otp.findUnique({
        where: { email }
    })
}

export const createOTP = async (data: any) => {
    return await prisma.otp.create({
        data
    })
}

export const updateOTP = async (id: number, data: any) => {
    return await prisma.otp.update({
        where: { id },
        data
    })
}