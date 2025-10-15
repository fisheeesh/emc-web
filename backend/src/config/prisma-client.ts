import { PrismaClient } from "../../generated/prisma";
import { getStatusFromScore } from "../utils/helplers";

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
                    return getStatusFromScore(+employee.avgScore);
                }
            },
            points: {
                needs: { points: true },
                compute(employee) {
                    return Number(employee.points)
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
        notification: {
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
                        year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric"
                    })
                }
            },
            checkInTime: {
                needs: { updatedAt: true },
                compute(emotionCheckIn) {
                    return emotionCheckIn.updatedAt.toLocaleTimeString("en-US", {
                        year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric"
                    })
                },
            },
            status: {
                needs: { emotionScore: true },
                compute(emotionCheckIn) {
                    return getStatusFromScore(+emotionCheckIn.emotionScore);
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