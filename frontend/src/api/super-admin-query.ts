/* eslint-disable @typescript-eslint/no-unused-vars */
import { superApi } from "."

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
    const res = await superApi.get(`super-admin/all-emp-infinite${query}`)

    return res.data
}

export const empInfiniteQuery = (kw: string | null = null, dep: string | null = null, role: string | null = null, jobType: string | null = null, accType: string | null = null, status: string | null = null, ts: string | null = null) => ({
    queryKey: ['emp', 'infinite', kw ?? undefined, dep ?? undefined, role ?? undefined, jobType ?? undefined, accType ?? undefined, status ?? undefined, ts ?? undefined],
    queryFn: ({ pageParam = null }: { pageParam?: number | null }) => fetchEmpInfinite({ pageParam, kw, dep, role, jobType, accType, status, ts }),
    initialPageParam: null,
    // @ts-expect-error ignore type check
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor ?? undefined
})