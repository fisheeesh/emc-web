import queryClient from "@/api/query"
import { allEmployeesQuery } from "@/api/super-admin-query"

export const managementsLoader = async () => {
    await queryClient.ensureQueryData(allEmployeesQuery())

    return null
}