import { prisma } from "../config/prisma-client"

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
    return await prisma.employee.delete({
        where: { id }
    })
}