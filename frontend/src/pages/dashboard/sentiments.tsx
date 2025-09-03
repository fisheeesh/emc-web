import { moodOverviewQuery } from "@/api/query";
import OverViewChart from "@/components/dashboard/charts/overview-chart";
import SentimentsComparisonChart from "@/components/dashboard/charts/sentiments-comparison-chart";
import CriticalTable from "@/components/dashboard/tables/critical-table";
import WatchListTable from "@/components/dashboard/tables/watchlist-table";
import useTitle from "@/hooks/use-title";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Chart as ChartJS, ArcElement, Tooltip, CategoryScale, LineElement, LinearScale, PointElement, Legend } from "chart.js";
import { useSearchParams } from "react-router";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function SentimentsDashboardPage() {
    useTitle("Sentiments Dashboard")

    const [searchParams] = useSearchParams()

    const duration = searchParams.get('duration') || 'today'

    const { data: overviewData } = useSuspenseQuery(moodOverviewQuery(duration))

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-3 lg:h-[420px]">
                {/* Overview Chart */}
                <OverViewChart percentages={overviewData?.percentages ?? []} duration={duration} />

                {/* Sentiments Comparison Chart */}
                <SentimentsComparisonChart />

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
