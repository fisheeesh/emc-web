import { actionAvgResponseTimeQuery, actionPlanStatusQuery, depHeatMapQuery, topConcernWordsQuery } from "@/api/super-admin-query";
import { ActionPlanStatusChart } from "@/components/temp/action-plan-status";
import { DepartmentHeatmap } from "@/components/temp/dep-heat-map";
import { ResponseTimeChart } from "@/components/temp/response-time-chart";
import { TopConcernsWordCloud } from "@/components/temp/top-concern-words";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function AnalyticsDashboardPage() {
    const { data: actionPlaStatusData } = useSuspenseQuery(actionPlanStatusQuery())
    const { data: depHeatmapData } = useSuspenseQuery(depHeatMapQuery())
    const { data: avgResponseTime } = useSuspenseQuery(actionAvgResponseTimeQuery())
    const { data: topConcernsWords } = useSuspenseQuery(topConcernWordsQuery())

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="w-full">
                <DepartmentHeatmap depHeatmapData={depHeatmapData.data} />
            </div>
            <div className="w-full">
                <TopConcernsWordCloud concernsData={topConcernsWords.data} recommendation={topConcernsWords.recommendation} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <ResponseTimeChart chartData={avgResponseTime.data} />
                <ActionPlanStatusChart chartData={actionPlaStatusData.data} />
            </div>
        </section>
    )
}
