import { PrismaClient } from "../../generated/prisma"

const prisma = new PrismaClient()

export const createCriticalEmp = async (empId: number, avgScore: number) => {
    return await prisma.$transaction(async (tx) => {
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