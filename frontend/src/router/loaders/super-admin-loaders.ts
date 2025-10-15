import queryClient from "@/api/query"
import { actionPlansQuery, empInfiniteQuery } from "@/api/super-admin-query"

export const managementsLoader = async () => {
    await Promise.all([
        queryClient.ensureInfiniteQueryData(empInfiniteQuery()),
        queryClient.ensureInfiniteQueryData(actionPlansQuery())
    ])

    return null
}