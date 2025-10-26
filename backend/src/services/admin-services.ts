import { prisma } from "../config/prisma-client";

export const getAdminUserData = async (id: number) => {
    return await prisma.employee.findFirst({
        where: { id },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatar: true,
            departmentId: true
        }
    })
}