import { PrismaClient } from "../../prisma/generated/prisma"
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