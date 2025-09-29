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

const fetchAttendanceOverview = async ({ q = null, empStatus = null, date = null }: {
    q?: string | null,
    empStatus?: string | null,
    date?: string | null
}) => {
    let query = q ? `&empName=${q}` : ''
    if (empStatus) query += `&status=${empStatus}`
    if (date) query += `&date=${date}`
    const res = await api.get(`admin/attendance-overview?${query}`)

    return res.data
}

export const attendanceOverviewQuery = (q: string | null = null, empStatus: string | null = null, date: string | null = null) => ({
    queryKey: ['attendance-overview', q, empStatus, date],
    queryFn: () => fetchAttendanceOverview({ q, empStatus, date }),
})

const fetchCheckInHours = async ({ date, month, year }: {
    date?: string | null,
    month?: string | null,
    year?: string | null,
}) => {
    const query = date ?
        `?duration=${date}&type=day`
        : month ? `?duration=${month}&type=month`
            : year ? `?duration=${year}&type=year` : ''

    const res = await api.get(`admin/check-in-hours${query}`)

    return res.data
}

export const checkInHoursQuery = (date: string | null = null, month: string | null = null, year: string | null = null) => ({
    queryKey: ['check-in-hours', date, month, year],
    queryFn: () => fetchCheckInHours({ date, month, year }),
})

export default queryClient