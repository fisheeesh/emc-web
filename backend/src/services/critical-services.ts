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
    return await prisma.employee.findMany(options)
}