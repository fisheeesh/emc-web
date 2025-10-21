import { adminUserDataQuery, criticalQuery, departmentsQuery, leaderboardsQuery, moodOverviewQuery, notificationQuery, sentimentsComparisonQuery, watchlistQuery } from "@/api/query";
import OverViewChart from "@/components/dashboard/charts/overview-chart";
import SentimentsComparisonChart from "@/components/dashboard/charts/sentiments-comparison-chart";
import CriticalTable from "@/components/dashboard/tables/critical-table";
import LeaderBoardTable from "@/components/dashboard/tables/leaderboard-table";
import WatchListTable from "@/components/dashboard/tables/watchlist-table";
import useTitle from "@/hooks/ui/use-title";
import useFilterStore from "@/store/filter-store";
import useNotiStore from "@/store/noti-store";
import useUserStore from "@/store/user-store";
import { useInfiniteQuery, useIsFetching, useSuspenseQuery } from "@tanstack/react-query";
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function SentimentsDashboardPage() {
    useTitle("Sentiments Dashboard")

    const { user, setUser } = useUserStore()
    const { setFilters } = useFilterStore()
    const { setNotis } = useNotiStore()
    const [searchParams] = useSearchParams()

    const gDep = searchParams.get('gDep') || 'all'
    const duration = searchParams.get('duration') || '1'
    const sentimentsFilter = searchParams.get("sentiments") || '7'
    const lKw = searchParams.get('lKw')
    const lduration = searchParams.get("lduration")
    const cKw = searchParams.get("cKw")
    const wKw = searchParams.get("wKw")
    const cTs = searchParams.get("cTs")
    const wTs = searchParams.get("wTs")
    const isResolved = searchParams.get("cStatus") || "all"

    const dep = user?.role === 'SUPERADMIN' ? gDep : user?.departmentId.toString()

    const { data: departmentsData } = useSuspenseQuery(departmentsQuery())
    const { data: adminUserData } = useSuspenseQuery(adminUserDataQuery())
    const { data: overviewData } = useSuspenseQuery(moodOverviewQuery(duration, dep))
    const { data: sentimentsComparison } = useSuspenseQuery(sentimentsComparisonQuery(sentimentsFilter, dep))
    const { data: leaderboardsData } = useSuspenseQuery(leaderboardsQuery(lKw, dep, lduration))
    const { data: notificationsData } = useSuspenseQuery(notificationQuery())

    const {
        status: cStatus,
        data: cData,
        error: cError,
        isFetching: isCFetching,
        isFetchingNextPage: isCFetchingNextPage,
        fetchNextPage: fetchCNextPage,
        hasNextPage: hasCNextPage,
    } = useInfiniteQuery(criticalQuery(cKw, dep, cTs, isResolved))

    const {
        status: wStatus,
        data: wData,
        error: wError,
        isFetching: isWFetching,
        isFetchingNextPage: isWFetchingNextPage,
        fetchNextPage: fetchWNextPage,
        hasNextPage: hasWNextPage,
    } = useInfiniteQuery(watchlistQuery(wKw, dep, wTs))

    const allCriticals = cData?.pages.flatMap(page => page.data) ?? []
    const allWatchlists = wData?.pages.flatMap(page => page.data) ?? []

    const isLeaderboardRefetching = useIsFetching({
        queryKey: ['leaderboards']
    }) > 0

    useEffect(() => {
        if (departmentsData) {
            setFilters({
                departments: departmentsData.data
            })
        }

        if (notificationsData) {
            setNotis(notificationsData.data)
        }

        if (adminUserData) {
            setUser({
                id: adminUserData.data.id,
                fullName: adminUserData.data.fullName,
                email: adminUserData.data.email,
                avatar: adminUserData.data.avatar,
                role: adminUserData.data.role,
                departmentId: adminUserData.data.departmentId
            })
        }
    }, [departmentsData, adminUserData, setUser, setFilters, notificationsData, setNotis])

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-3 lg:h-[420px]">
                {/* Overview Chart */}
                <OverViewChart percentages={overviewData.data} duration={duration} />

                {/* Sentiments Comparison Chart */}
                <SentimentsComparisonChart data={sentimentsComparison.data} />

            </div>
            <div className="w-full">
                {/* Critical Employees Table */}
                <LeaderBoardTable data={leaderboardsData.data} isLoading={isLeaderboardRefetching} />
            </div>
            <div className="w-full">
                {/* Critical Employees Table */}
                <CriticalTable
                    data={allCriticals}
                    status={cStatus}
                    error={cError}
                    isFetching={isCFetching}
                    isFetchingNextPage={isCFetchingNextPage}
                    fetchNextPage={fetchCNextPage}
                    hasNextPage={hasCNextPage}
                />
            </div>
            <div className="w-full">
                {/* Watchlist Employees Table */}
                <WatchListTable
                    data={allWatchlists}
                    status={wStatus}
                    error={wError}
                    isFetching={isWFetching}
                    isFetchingNextPage={isWFetchingNextPage}
                    fetchNextPage={fetchWNextPage}
                    hasNextPage={hasWNextPage}
                />
            </div>
        </section>
    )
}
