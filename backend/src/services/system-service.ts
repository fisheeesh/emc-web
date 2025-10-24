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
        where: {
            isActive: true
        },
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

type EmailFilterOptions = {
    departmentId?: number
    role?: "ADMIN" | "SUPERADMIN"
    excludeEmployeeId?: number
    excludeSuperAdmins?: boolean
}

export const getEmployeeEmails = async (options: EmailFilterOptions = {}) => {
    const {
        departmentId,
        role,
        excludeEmployeeId,
        excludeSuperAdmins = false
    } = options

    const where: any = {}

    if (departmentId !== undefined) {
        where.departmentId = departmentId
    }

    if (role) {
        where.role = role
    }

    if (excludeEmployeeId !== undefined) {
        where.id = { notIn: [excludeEmployeeId] }
    }

    if (excludeSuperAdmins) {
        where.role = { not: "SUPERADMIN" }
    }

    const results = await prisma.employee.findMany({
        where,
        select: { email: true }
    })

    return results.map(({ email }) => email)
}