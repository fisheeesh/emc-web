import { PrismaClient } from "../../generated/prisma";

export const prisma = new PrismaClient().$extends({
    result: {
        employee: {
            fullName: {
                needs: { firstName: true, lastName: true },
                compute(employee) {
                    return `${employee.firstName} ${employee.lastName}`
                }
            },
            avatar: {
                needs: { avatar: true, },
                compute(employee) {
                    return `/optimizes/${employee.avatar?.split(".")[0]}.webp`
                }
            },
            status: {
                needs: { avgScore: true },
                compute(employee) {
                    return +employee.avgScore >= 0.4 ? 'positive' : +employee.avgScore >= -0.3 ? 'neutral' : +employee.avgScore > -0.8 ? 'negative' : 'critical'
                }
            },
            createdAt: {
                needs: { createdAt: true },
                compute(employee) {
                    return employee.createdAt.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                    })
                }
            }
        },
        emotionCheckIn: {
            updatedAt: {
                needs: { updatedAt: true },
                compute(emotionCheckIn) {
                    return emotionCheckIn.updatedAt.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"
                    })
                }
            },
            checkInTime: {
                needs: { updatedAt: true },
                compute(emotionCheckIn) {
                    return emotionCheckIn.updatedAt.toLocaleTimeString("en-US", {
                        timeZone: "Asia/Bangkok",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    });
                },
            },
            status: {
                needs: { emotionScore: true },
                compute(emotionCheckIn) {
                    return +emotionCheckIn.emotionScore >= 0.4 ? 'positive' : +emotionCheckIn.emotionScore >= -0.3 ? 'neutral' : +emotionCheckIn.emotionScore > -0.8 ? 'negative' : 'critical'
                }
            },
            emotionScore: {
                needs: { emotionScore: true },
                compute(emotionCheckIn) {
                    return Number(emotionCheckIn.emotionScore)
                }
            }
        },
    }
})