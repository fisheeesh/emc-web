import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient()

export const getSettingStatus = async (key: string) => {
    return await prisma.setting.findUnique({
        where: { key }
    })
}

export const createOrUpdateSettingStatus = async (key: string, value: string) => {
    return await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    })
}

export const getAllDepartmentsData = async () => {
    const deps = await prisma.department.findMany({
        orderBy: {
            name: 'asc'
        }
    })

    const result = [
        { name: 'All Departments', value: "all" },
        ...deps.map(dep => ({
            name: dep.name,
            value: dep.id.toString()
        }))
    ]

    return result
}