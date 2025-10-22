/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { superApi } from "."
import queryClient from "./query";

export const invalidateEmpQueries = async () => {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['emps', 'infinite'], exact: false }),
        queryClient.invalidateQueries({ queryKey: ['departments'] }),
        queryClient.invalidateQueries({ queryKey: ['summary'], exact: false }),
    ]);
};

const fetchEmpInfinite = async ({ pageParam = null, kw = null, dep = null, role = null, jobType = null, accType = null, status = null, ts = null }: {
    pageParam?: number | null, kw?: string | null, dep?: string | null, role?: string | null, jobType?: string | null, accType?: string | null, status?: string | null, ts?: string | null
}) => {
    let query = pageParam ? `?limit=7&cursor=${pageParam}` : "?limit=7"
    if (kw) query += `&kw=${kw}`
    if (dep) query += `&dep=${dep}`
    if (jobType) query += `&jobType=${jobType}`
    if (accType) query += `&accType=${accType}`
    if (role) query += `&role=${role}`
    if (status) query += `&status=${status}`
    if (ts) query += `&ts=${ts}`
    const res = await superApi.get(`super-admin/emps-infinite${query}`)

    return res.data
}

export const empInfiniteQuery = (kw: string | null = null, dep: string | null = null, role: string | null = null, jobType: string | null = null, accType: string | null = null, status: string | null = null, ts: string | null = null) => ({
    queryKey: ['emps', 'infinite', kw ?? undefined, dep ?? undefined, role ?? undefined, jobType ?? undefined, accType ?? undefined, status ?? undefined, ts ?? undefined],
    queryFn: ({ pageParam = null }: { pageParam?: number | null }) => fetchEmpInfinite({ pageParam, kw, dep, role, jobType, accType, status, ts }),
    initialPageParam: null,
    // @ts-expect-error ignore type check
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined
})

const fetchAllActionPlans = async ({ pageParam = null, kw = null, dep = null, priority = null, status = null, type = null, ts = null }: {
    pageParam?: number | null, kw?: string | null, dep?: string | null, priority?: string | null, status?: string | null, type?: string | null, ts?: string | null
}) => {
    let query = pageParam ? `?limit=7&cursor=${pageParam}` : "?limit=7"
    if (kw) query += `&kw=${kw}`
    if (dep) query += `&dep=${dep}`
    if (priority) query += `&priority=${priority}`
    if (status) query += `&status=${status}`
    if (type) query += `&type=${type}`
    if (ts) query += `&ts=${ts}`
    const res = await superApi.get(`/super-admin/action-plans${query}`)

    return res.data
}

export const actionPlansQuery = (kw: string | null = null, dep: string | null = null, priority: string | null = null, status: string | null = null, type: string | null = null, ts: string | null = null) => ({
    queryKey: ["action-plans", "infinite", kw ?? undefined, dep ?? undefined, priority ?? undefined, status ?? undefined, type ?? undefined, ts ?? undefined],
    queryFn: ({ pageParam = null }: { pageParam?: number | null }) => fetchAllActionPlans({ pageParam, kw, dep, priority, status, type, ts }),
    initialPageParam: null,
    // @ts-expect-error ignore type check
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined
})

const fetchSummaryData = async (dep: string | null = null) => {
    const query = dep ? `?dep=${dep}` : ''
    const res = await superApi.get(`/super-admin/summary${query}`)

    return res.data
}

export const summaryDataQuery = (dep: string | null = null) => ({
    queryKey: ['summary', dep ?? undefined],
    queryFn: () => fetchSummaryData(dep)
})

const fetchActionPlanStatus = async () => {
    const res = await superApi.get('/super-admin/action-plan-status')

    return res.data
}

export const actionPlanStatusQuery = () => ({
    queryKey: ['action-plan-status'],
    queryFn: fetchActionPlanStatus
})

const fetchDepHeatMap = async () => {
    const res = await superApi.get('/super-admin/departments-heatmap')

    return res.data
}

export const depHeatMapQuery = () => ({
    queryKey: ['departments-heatmap'],
    queryFn: fetchDepHeatMap
})

const fetchActionAvgResponseTime = async () => {
    const res = await superApi.get("/super-admin/action-avg-response-time")

    return res.data
}

export const actionAvgResponseTimeQuery = () => ({
    queryKey: ['action-avg-response-time'],
    queryFn: fetchActionAvgResponseTime
})


const fetchCountries = async () => {
    const res = await axios.get("https://restcountries.com/v2/all?fields=name,flag")

    return res.data
}

export const countriesQuery = () => ({
    queryKey: ['countries'],
    queryFn: fetchCountries
})