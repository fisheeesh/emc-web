import { prisma } from "../config/prisma-client";

export const getAllActionPlansInfinite = async (options: any) => {
    return await prisma.actionPlan.findMany(options)
}