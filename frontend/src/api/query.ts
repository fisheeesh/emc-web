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

export default queryClient