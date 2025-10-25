import { actionAvgResponseTimeQuery, actionPlanStatusQuery, depHeatMapQuery, topConcernWordsQuery } from "@/api/super-admin-query";
import { ActionPlanStatusChart } from "@/components/dashboard/charts/action-plan-status";
import { ResponseTimeChart } from "@/components/dashboard/charts/response-time-chart";
import { DepartmentHeatmap } from "@/components/dashboard/dep-heat-map";
import { TopConcernsWordCloud } from "@/components/dashboard/top-concern-words";
import useTitle from "@/hooks/ui/use-title";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

export default function AnalyticsDashboardPage() {
    useTitle("Analytics & Insights")

    const [searchParams] = useSearchParams()

    const timeRange = searchParams.get("timeRange")

    const { data: actionPlaStatusData } = useSuspenseQuery(actionPlanStatusQuery())
    const { data: depHeatmapData } = useSuspenseQuery(depHeatMapQuery())
    const { data: avgResponseTime } = useSuspenseQuery(actionAvgResponseTimeQuery())
    const { data: topConcernsWords } = useSuspenseQuery(topConcernWordsQuery(timeRange, false))

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="w-full">
                <DepartmentHeatmap depHeatmapData={depHeatmapData.data} />
            </div>
            <div className="w-full">
                <TopConcernsWordCloud
                    concernsData={topConcernsWords.data}
                    recommendation={topConcernsWords.recommendation}
                    generatedAt={topConcernsWords.generatedAt}
                    isCached={topConcernsWords.isCached}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <ResponseTimeChart chartData={avgResponseTime.data} />
                <ActionPlanStatusChart chartData={actionPlaStatusData.data} />
            </div>
        </section>
    )
}
