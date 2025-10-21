import queryClient from "@/api/query"
import { actionPlansQuery, actionPlanStatusQuery, countriesQuery, depHeatMapQuery, empInfiniteQuery, summaryDataQuery } from "@/api/super-admin-query"

export const managementsLoader = async () => {
    await Promise.all([
        queryClient.ensureInfiniteQueryData(empInfiniteQuery()),
        queryClient.ensureInfiniteQueryData(actionPlansQuery()),
        queryClient.ensureQueryData(summaryDataQuery()),
        queryClient.ensureQueryData(countriesQuery()),
    ])

    return null
}

export const analyticsLoader = async () => {
    await Promise.all([
        queryClient.ensureQueryData(actionPlanStatusQuery()),
        queryClient.ensureQueryData(depHeatMapQuery()),
    ])

    return null
}