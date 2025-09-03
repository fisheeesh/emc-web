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

const fetchMoodOverview = async (q?: string | null) => {
    const query = q ? `?duration=${q}` : '?duration=today'
    const res = await api.get(`admin/mood-overview${query}`)

    return res.data
}

export const moodOverviewQuery = (q?: string | null) => ({
    queryKey: ['mood-overview', q],
    queryFn: () => fetchMoodOverview(q)
})

export const fetchSentimentsComparison = async (q?: string | null) => {
    const query = q ? `?duration=${q}` : '?duration=7'
    const res = await api.get(`admin/sentiments-comparison${query}`)

    return res.data
}

export const sentimentsComparisonQuery = (q?: string | null) => ({
    queryKey: ['sentiments-comparison', q],
    queryFn: () => fetchSentimentsComparison(q),
})

const fetchDailyAttendance = async () => {
    const res = await api.get('admin/daily-attendance')

    return res.data
}

export const dailyAttendanceQuery = () => ({
    queryKey: ['daily-attendance'],
    queryFn: fetchDailyAttendance,
})

const fetchAttendanceOverview = async ({ q = null, empStatus = null }: {
    q?: string | null,
    empStatus?: string | null
}) => {
    let query = q ? `&empName=${q}` : ''
    if (empStatus) query += `&status=${empStatus}`
    const res = await api.get(`admin/attendance-overview?${query}`)

    return res.data
}

export const attendanceOverviewQuery = (q: string | null = null, empStatus: string | null = null) => ({
    queryKey: ['attendance-overview', q, empStatus],
    queryFn: () => fetchAttendanceOverview({ q, empStatus }),
})

export default queryClient