/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    QueryClient,
} from '@tanstack/react-query'
import api from '.'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // staleTime: 5 * 60 * 1000,
            staleTime: 0
        }
    }
})

const fetchAdminUserData = async () => {
    const res = await api.get("admin/admin-user")

    return res.data
}

export const adminUserDataQuery = () => ({
    queryKey: ['admin-user'],
    queryFn: fetchAdminUserData
})

const fetchDepartments = async () => {
    const res = await api.get("admin/all-departments")

    return res.data
}

export const departmentsQuery = () => ({
    queryKey: ['departments'],
    queryFn: fetchDepartments
})

const fetchMoodOverview = async (q?: string | null, dep?: string | null) => {
    let query = "?"
    if (q) query += `duration=${q}`
    if (dep) query += `&dep=${dep}`
    const res = await api.get(`admin/mood-overview${query}`)

    return res.data
}

export const moodOverviewQuery = (q?: string | null, dep?: string | null) => ({
    queryKey: ['mood-overview', q ?? undefined, dep ?? undefined],
    queryFn: () => fetchMoodOverview(q, dep),
})

export const fetchSentimentsComparison = async (q?: string | null, dep?: string | null) => {
    let query = "?"
    if (q) query += `duration=${q}`
    if (dep) query += `&dep=${dep}`
    const res = await api.get(`admin/sentiments-comparison${query}`)

    return res.data
}

export const sentimentsComparisonQuery = (q?: string | null, dep?: string | null) => ({
    queryKey: ['sentiments-comparison', q ?? undefined, dep ?? undefined],
    queryFn: () => fetchSentimentsComparison(q, dep),
})

const fetchDailyAttendance = async (dep?: string | null) => {
    const res = await api.get(`admin/daily-attendance?dep=${dep}`)

    return res.data
}

export const dailyAttendanceQuery = (dep?: string | null) => ({
    queryKey: ['daily-attendance', dep ?? undefined],
    queryFn: () => fetchDailyAttendance(dep),
})

const fetchAttendanceOverview = async ({ pageParam = null, q = null, empStatus = null, date = null, dep = null, ts = null }: {
    pageParam?: number | null,
    q?: string | null,
    empStatus?: string | null,
    date?: string | null,
    dep?: string | null,
    ts?: string | null
}) => {
    let query = pageParam ? `?limit=7&cursor=${pageParam}` : "?limit=7"
    if (q) query += `&kw=${q}`
    if (empStatus) query += `&status=${empStatus}`
    if (date) query += `&date=${date}`
    if (dep) query += `&dep=${dep}`
    if (ts) query += `&ts=${ts}`
    const res = await api.get(`admin/attendance-overview${query}`)

    return res.data
}

export const attendanceOverviewQuery = (q: string | null = null, empStatus: string | null = null, date: string | null = null, dep: string | null = null, ts: string | null = null) => ({
    queryKey: ['attendance-overview', 'infinite', q, empStatus, date, dep, ts],
    queryFn: ({ pageParam = null }: { pageParam: number | null }) => fetchAttendanceOverview({ pageParam, q, empStatus, date, dep, ts }),
    initialPageParam: null,
    // @ts-expect-error ignore type check
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined
})

const fetchCheckInHours = async ({ date, month, year, dep }: {
    date?: string | null,
    month?: string | null,
    year?: string | null,
    dep?: string | null,
}) => {
    let query = "?"
    if (date) query += `&duration=${date}&type=day`
    else if (month) query += `&duration=${month}&type=month`
    else if (year) query += `&duration=${year}&type=year`
    if (dep) query += `&dep=${dep}`

    const res = await api.get(`admin/check-in-hours${query}`)

    return res.data
}

export const checkInHoursQuery = (date: string | null = null, month: string | null = null, year: string | null = null, dep: string | null = null) => ({
    queryKey: ['check-in-hours', date, month, year, dep],
    queryFn: () => fetchCheckInHours({ date, month, year, dep }),
})

const fetchLeaderboards = async ({ lKw, dep, duration }: {
    lKw?: string | null,
    dep?: string | null,
    duration?: string | null
}) => {
    let query = '?'
    if (lKw) query += `&kw=${lKw}`
    else if (duration) query += `&duration=${duration}`
    if (dep) query += `&dep=${dep}`

    const res = await api.get(`admin/leaderboards${query}`)

    return res.data
}

export const leaderboardsQuery = (lKw: string | null = null, dep: string | null = null, duration: string | null = null) => ({
    queryKey: ['leaderboards', lKw ?? undefined, dep ?? undefined, duration ?? undefined],
    queryFn: () => fetchLeaderboards({ lKw, dep, duration })
})

const fetchAllNotifications = async () => {
    const res = await api.get("/admin/notifications")

    return res.data
}

export const notificationQuery = () => ({
    queryKey: ['notifications'],
    queryFn: fetchAllNotifications
})

const fetchAllCriticalEmps = async ({ pageParam, cKw, dep, ts, status }: {
    pageParam?: number | null,
    cKw?: string | null,
    dep?: string | null,
    ts?: string | null,
    status?: string | null
}) => {
    let query = pageParam ? `?limit=7&cursor=${pageParam}` : "?limit=7"
    if (cKw) query += `&kw=${cKw}`
    if (dep) query += `&dep=${dep}`
    if (ts) query += `&ts=${ts}`
    if (status) query += `&status=${status}`
    const res = await api.get(`/admin/critical-emps${query}`)

    return res.data
}

export const criticalQuery = (cKw: string | null = null, dep: string | null = null, ts: string | null = null, status: string | null = null) => ({
    queryKey: ['critical', 'infinite', cKw, dep, ts, status],
    queryFn: ({ pageParam = null }: { pageParam: number | null }) => fetchAllCriticalEmps({ pageParam, cKw, dep, ts, status }),
    initialPageParam: null,
    // @ts-expect-error ignore type check
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined
})

const fetchAllWatchlistEmps = async ({ pageParam, wKw, dep, ts }: {
    pageParam?: number | null,
    wKw?: string | null,
    dep?: string | null,
    ts?: string | null
}) => {
    let query = pageParam ? `?limit=7&cursor=${pageParam}` : "?limit=7"
    if (wKw) query += `&kw=${wKw}`
    if (dep) query += `&dep=${dep}`
    if (ts) query += `&ts=${ts}`
    const res = await api.get(`/admin/watchlist-emps${query}`)

    return res.data
}

export const watchlistQuery = (wKw: string | null = null, dep: string | null = null, ts: string | null = null) => ({
    queryKey: ['watchlist', 'infinite', wKw, dep, ts],
    queryFn: ({ pageParam = null }: { pageParam: number | null }) => fetchAllWatchlistEmps({ pageParam, wKw, dep, ts }),
    initialPageParam: null,
    // @ts-expect-error ignore type check
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined
})

export default queryClient