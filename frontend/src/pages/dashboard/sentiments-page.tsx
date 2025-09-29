import { adminUserDataQuery, departmentsQuery, moodOverviewQuery, sentimentsComparisonQuery } from "@/api/query";
import OverViewChart from "@/components/dashboard/charts/overview-chart";
import SentimentsComparisonChart from "@/components/dashboard/charts/sentiments-comparison-chart";
import CriticalTable from "@/components/dashboard/tables/critical-table";
import WatchListTable from "@/components/dashboard/tables/watchlist-table";
import useTitle from "@/hooks/use-title";
import useFilterStore from "@/store/filter-store";
import useUserStore from "@/store/user-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Tooltip } from "chart.js";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function SentimentsDashboardPage() {
    useTitle("Sentiments Dashboard")

    const { setUser } = useUserStore()
    const { setFilters } = useFilterStore()
    const [searchParams] = useSearchParams()

    const duration = searchParams.get('duration') || 'today'
    const sentimentsFilter = searchParams.get("sentiments") || '7'

    const { data: departmentsData } = useSuspenseQuery(departmentsQuery())
    const { data: adminUserData } = useSuspenseQuery(adminUserDataQuery())

    const { data: overviewData } = useSuspenseQuery(moodOverviewQuery(duration))
    const { data: sentimentsComparison } = useSuspenseQuery(sentimentsComparisonQuery(sentimentsFilter))

    useEffect(() => {
        if (departmentsData) {
            setFilters({
                departments: departmentsData.data
            })
        }

        if (adminUserData) {
            setUser({
                id: adminUserData.data.id,
                fullName: adminUserData.data.fullName,
                email: adminUserData.data.email,
                avatar: adminUserData.data.avatar,
                role: adminUserData.data.role
            })
        }
    }, [departmentsData, adminUserData, setUser, setFilters])

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
                <CriticalTable />
            </div>
            <div className="w-full">
                {/* Watchlist Employees Table */}
                <WatchListTable />
            </div>
        </section>
    )
}
