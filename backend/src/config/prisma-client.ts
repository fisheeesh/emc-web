import { PrismaClient } from "../../prisma/generated/prisma";
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
            status: {
                needs: { avgScore: true },
                compute(employee) {
                    return getStatusFromScore(+employee.avgScore);
                }
            },
            age: {
                needs: { birthdate: true },
                compute(employee) {
                    if (employee.birthdate == null) return null;
                    const birthDate = new Date(employee.birthdate);
                    const ageDifMs = Date.now() - birthDate.getTime();
                    const ageDate = new Date(ageDifMs);
                    return Math.abs(ageDate.getUTCFullYear() - 1970);
                }
            },
        },
        emotionCheckIn: {
            checkInTime: {
                needs: { createdAt: true },
                compute(emotionCheckIn) {
                    return emotionCheckIn.createdAt.toLocaleTimeString("en-US", {
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
        setting: {
            positiveMin: {
                needs: { positiveMin: true },
                compute(setting) {
                    return Number(setting.positiveMin)
                }
            },
            positiveMax: {
                needs: { positiveMax: true },
                compute(setting) {
                    return Number(setting.positiveMax)
                }
            },
            negativeMin: {
                needs: { negativeMin: true },
                compute(setting) {
                    return Number(setting.negativeMin)
                }
            },
            negativeMax: {
                needs: { negativeMax: true },
                compute(setting) {
                    return Number(setting.negativeMax)
                }
            },
            neutralMin: {
                needs: { neutralMin: true },
                compute(setting) {
                    return Number(setting.neutralMin)
                }
            },
            neutralMax: {
                needs: { neutralMax: true },
                compute(setting) {
                    return Number(setting.neutralMax)
                }
            },
            criticalMin: {
                needs: { criticalMin: true },
                compute(setting) {
                    return Number(setting.criticalMin)
                }
            },
            criticalMax: {
                needs: { criticalMax: true },
                compute(setting) {
                    return Number(setting.criticalMax)
                }
            },
        },
    }
})