import { PrismaClient } from "../../generated/prisma";
import { prisma } from "../config/prisma-client";

const prismaClient = new PrismaClient()

export const getAllActionPlansInfinite = async (options: any) => {
    return await prisma.actionPlan.findMany(options)
}