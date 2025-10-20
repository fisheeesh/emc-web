import queryClient from "@/api/query"
import { actionPlansQuery, countriesQuery, empInfiniteQuery } from "@/api/super-admin-query"

export const managementsLoader = async () => {
    await Promise.all([
        queryClient.ensureInfiniteQueryData(empInfiniteQuery()),
        queryClient.ensureInfiniteQueryData(actionPlansQuery()),
        queryClient.ensureQueryData(countriesQuery())
    ])

    return null
}