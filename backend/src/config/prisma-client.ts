import { PrismaClient } from "../../generated/prisma";
import { emotionCheckIn } from "../controllers/user/user-controller";

export const prisma = new PrismaClient().$extends({
    result: {
        employee: {
            fullName: {
                needs: { firstName: true, lastName: true },
                compute(employee) {
                    return `${employee.firstName} ${employee.lastName}`
                }
            }
        },
        emotionCheckIn: {
            createdAt: {
                needs: { createdAt: true },
                compute(emotionCheckIn) {
                    return emotionCheckIn.createdAt.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"
                    })
                }
            },
            emotionScore: {
                needs: { emotionScore: true },
                compute(emotionCheckIn) {
                    return Number(emotionCheckIn.emotionScore)
                }
            }
        }
    }
})