import { ActionPlanStatusChart } from "@/components/temp/actoin-plan-status";
import { DepartmentHeatmap } from "@/components/temp/dep-heat-map";
import { ResponseTimeChart } from "@/components/temp/response-time-chart";
import { TopConcernsWordCloud } from "@/components/temp/top-concern-words";

export default function AnalyticsDashboardPage() {
    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="w-full">
                <DepartmentHeatmap />
            </div>
            <div className="w-full">
                <TopConcernsWordCloud />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                <ResponseTimeChart />
                <ActionPlanStatusChart />
            </div>
        </section>
    )
}
