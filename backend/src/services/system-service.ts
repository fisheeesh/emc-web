import { startOfTomorrow, endOfTomorrow, startOfToday } from "date-fns";
import { PrismaClient } from "../../generated/prisma";
import { EmailQueue } from "../jobs/queues/email-queue";
import { due_tomorrow_subject, due_tomorrow_body, action_overdue_subject, action_overdue_body, superadmin_overdue_subject, superadmin_overdue_body } from "../utils/email-templates";
import { prisma } from "../config/prisma-client";

const prismaClient = new PrismaClient()

export const getSettingStatus = async (key: string) => {
    return await prismaClient.setting.findUnique({
        where: { key }
    })
}

export const createOrUpdateSettingStatus = async (key: string, value: string) => {
    return await prismaClient.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    })
}

export const getAllDepartmentsData = async () => {
    const deps = await prismaClient.department.findMany({
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

    const results = await prismaClient.employee.findMany({
        where,
        select: { email: true }
    })

    return results.map(({ email }) => email)
}

export const cronCheckActionPlans = async () => {
    try {
        //* Get action plans due tomorrow
        const tomorrowActionPlans = await prisma.actionPlan.findMany({
            where: {
                dueDate: {
                    gte: startOfTomorrow(),
                    lte: endOfTomorrow()
                },
                type: {
                    not: 'COMPLETED'
                }
            },
            include: {
                criticalEmployee: {
                    select: {
                        employee: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                }
            }
        });

        //* Get overdue action plans
        const overdueActionPlans = await prisma.actionPlan.findMany({
            where: {
                dueDate: {
                    lt: startOfToday()
                },
                type: {
                    not: 'COMPLETED'
                }
            },
            include: {
                criticalEmployee: {
                    select: {
                        employee: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                },
                department: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const emailPromises = [];

        if (tomorrowActionPlans.length > 0) {
            for (const plan of tomorrowActionPlans) {
                //* Email to responsible admin
                emailPromises.push(
                    EmailQueue.add("notify-email", {
                        subject: due_tomorrow_subject(plan.criticalEmployee.employee.fullName),
                        body: due_tomorrow_body(
                            plan.criticalEmployee.employee.fullName,
                            plan.assignTo,
                            plan.dueDate.toString(),
                            plan.priority
                        ),
                        to: [plan.contact],
                    }, {
                        attempts: 3,
                        backoff: {
                            type: "exponential",
                            delay: 2000
                        }
                    })
                );
            }
        }

        if (overdueActionPlans.length > 0) {
            const superAdminEmails = await getEmployeeEmails({ role: "SUPERADMIN" });

            for (const plan of overdueActionPlans) {
                await prisma.actionPlan.update({
                    where: { id: plan.id },
                    data: {
                        type: "FAILED"
                    }
                })
                //* Email to responsible admin
                emailPromises.push(
                    EmailQueue.add("notify-email", {
                        subject: action_overdue_subject(plan.criticalEmployee.employee.fullName),
                        body: action_overdue_body(
                            plan.criticalEmployee.employee.fullName,
                            plan.assignTo,
                            plan.dueDate.toString(),
                            plan.priority
                        ),
                        to: [plan.contact],
                    }, {
                        attempts: 3,
                        backoff: {
                            type: "exponential",
                            delay: 2000
                        }
                    })
                );

                if (superAdminEmails.length > 0) {
                    //* Email to super-admins
                    emailPromises.push(
                        EmailQueue.add("notify-email", {
                            subject: superadmin_overdue_subject(plan.criticalEmployee.employee.fullName),
                            body: superadmin_overdue_body(
                                plan.criticalEmployee.employee.fullName,
                                plan.assignTo,
                                plan.dueDate.toString(),
                                plan.priority,
                                plan.department.name
                            ),
                            to: superAdminEmails,
                        }, {
                            attempts: 3,
                            backoff: {
                                type: "exponential",
                                delay: 2000
                            }
                        })
                    );
                }
            }
        }

        if (emailPromises.length > 0) {
            await Promise.all(emailPromises);
            console.log(`Sent ${emailPromises.length} action plan notification emails`);
        } else {
            console.log('No action plan notifications to send');
        }

    } catch (error) {
        console.error('Error in cronCheckActionPlans:', error);
        throw error;
    }
};