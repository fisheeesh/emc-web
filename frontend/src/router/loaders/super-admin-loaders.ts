import queryClient from "@/api/query"
import { empInfiniteQuery } from "@/api/super-admin-query"

export const managementsLoader = async () => {
    await queryClient.ensureInfiniteQueryData(empInfiniteQuery())
    
    return null
}