import { prisma } from "../config/prisma-client"

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