import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient()

export const createEmotionCheckIn = async (emotion: any) => {
    const data = {
        emoji: emotion.emoji,
        textFeeling: emotion.textFeeling,
        emotionScore: emotion.emotionScore,
        employee: {
            connect: { id: emotion.employeeId }
        }
    }

    return await prisma.emotionCheckIn.create({
        data
    })
}

export const getEmpAverageScore = async (id: number) => {
    return await prisma.emotionCheckIn.aggregate({
        _avg: { emotionScore: true },
        where: { employeeId: id }
    })
}