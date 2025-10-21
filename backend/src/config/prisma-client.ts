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
            points: {
                needs: { points: true },
                compute(employee) {
                    return Number(employee.points)
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
        notification: {
            avatar: {
                needs: { avatar: true, },
                compute(notification) {
                    return `/optimizes/${notification.avatar?.split(".")[0]}.webp`
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
            points: {
                needs: { points: true },
                compute(employee) {
                    return Number(employee.points)
                }
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