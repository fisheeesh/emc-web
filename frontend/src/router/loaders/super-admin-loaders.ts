import queryClient from "@/api/query"
import { actionAvgResponseTimeQuery, actionPlansQuery, actionPlanStatusQuery, allDepartmentsDataQuery, countriesQuery, depHeatMapQuery, empInfiniteQuery, summaryDataQuery, topConcernWordsQuery } from "@/api/super-admin-query"

export const managementsLoader = async () => {
    await Promise.all([
        queryClient.ensureInfiniteQueryData(empInfiniteQuery()),
        queryClient.ensureInfiniteQueryData(actionPlansQuery()),
        queryClient.ensureQueryData(summaryDataQuery()),
        queryClient.ensureQueryData(countriesQuery()),
        queryClient.ensureQueryData(allDepartmentsDataQuery())
    ])

    return null
}

export const analyticsLoader = async () => {
    await Promise.all([
        queryClient.ensureQueryData(actionPlanStatusQuery()),
        queryClient.ensureQueryData(depHeatMapQuery()),
        queryClient.ensureQueryData(actionAvgResponseTimeQuery()),
        queryClient.ensureQueryData(topConcernWordsQuery())
    ])

    return null
}