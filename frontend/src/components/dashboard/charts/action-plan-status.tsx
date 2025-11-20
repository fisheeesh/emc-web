import { FileText } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import Empty from "../../ui/empty"

const chartConfig = {
    count: {
        label: "Action Plans",
    },
    pending: {
        label: "Pending",
        color: "#a855f7",
    },
    approved: {
        label: "Approved",
        color: "#22c55e",
    },
    rejected: {
        label: "Rejected",
        color: "#ef4444",
    },
} satisfies ChartConfig

export function ActionPlanStatusChart({ chartData }: { chartData: ActionPlanStatus[] }) {
    const numericChartData = chartData.map(d => ({
        ...d,
        count: Number(d.count ?? 0),
    }))

    const totalPlans = numericChartData.reduce((acc, curr) => acc + curr.count, 0)

    const getCount = (status: string) =>
        numericChartData.find(d => d.status.toLowerCase() === status.toLowerCase())?.count ?? 0

    const getPercent = (status: string) => {
        const count = getCount(status)
        return totalPlans > 0 ? (count / totalPlans) * 100 : 0
    }

    if (!numericChartData.length || totalPlans === 0) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="pb-0">
                    <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                        <FileText className="size-5" />
                        Action Plan Status
                    </CardTitle>
                    <CardDescription>Current status distribution of all action plans</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-6">
                    <div className="flex flex-col max-w-xs sm:max-w-sm md:max-w-md mx-auto items-center justify-center py-8">
                        <Empty label="No action plans found. Create action plans for critical employees to track their status here." />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <FileText className="size-5" />
                    Action Plan Status
                </CardTitle>
                <CardDescription>Current status distribution of all action plans</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, name) => {
                                        const numericValue = Number(value ?? 0)
                                        const pct = totalPlans > 0 ? ((numericValue / totalPlans) * 100).toFixed(1) : "0.0"
                                        return (
                                            <div className="flex items-center gap-2">
                                                <span className="capitalize">{name}:</span>
                                                <span className="font-en font-semibold">{numericValue}</span>
                                                <span className="text-xs text-muted-foreground font-en">
                                                    ({pct}%)
                                                </span>
                                            </div>
                                        )
                                    }}
                                />
                            }
                        />
                        <Pie
                            data={numericChartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={60}
                            outerRadius={90}
                            strokeWidth={2}
                        >
                            {numericChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill ?? `var(--color-${entry.status})`} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>

                <div className="grid grid-cols-3 gap-4 mt-6 pb-6">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 font-en">
                            {getCount("pending")}
                        </p>
                        <p className="text-xs text-gray-500 font-en">
                            {getPercent("pending").toFixed(1)}%
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400 font-en">
                            {getCount("approved")}
                        </p>
                        <p className="text-xs text-gray-500 font-en">
                            {getPercent("approved").toFixed(1)}%
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rejected</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400 font-en">
                            {getCount("rejected")}
                        </p>
                        <p className="text-xs text-gray-500 font-en">
                            {getPercent("rejected").toFixed(1)}%
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ActionPlanStatusChart