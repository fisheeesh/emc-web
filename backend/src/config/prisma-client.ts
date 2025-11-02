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
            birthdate: {
                needs: { birthdate: true },
                compute(employee) {
                    return employee.birthdate ? employee.birthdate.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                    }) : null
                }
            },
            lastCritical: {
                needs: { lastCritical: true },
                compute(employee) {
                    return employee.lastCritical ? employee.lastCritical.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                    }) : null
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
        department: {
            createdAt: {
                needs: { createdAt: true },
                compute(department) {
                    return department.createdAt.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                    })
                }
            },
        },
        actionPlan: {
            dueDate: {
                needs: { dueDate: true },
                compute(actionPlan) {
                    return actionPlan.dueDate.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                    })
                }
            },
            completedAt: {
                needs: { completedAt: true },
                compute(actionPlan) {
                    return actionPlan.completedAt
                        ? actionPlan.completedAt.toLocaleDateString("en-US", {
                            year: "numeric", month: "long", day: "numeric"
                        })
                        : null
                }
            }
        },
        criticalEmployee: {
            createdAt: {
                needs: { createdAt: true },
                compute(criticalEmployee) {
                    return criticalEmployee.createdAt.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                    })
                }
            },
            resolvedAt: {
                needs: { resolvedAt: true },
                compute(criticalEmployee) {
                    return criticalEmployee.resolvedAt ? criticalEmployee.resolvedAt.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                    }) : null
                }
            }
        }
    }
})