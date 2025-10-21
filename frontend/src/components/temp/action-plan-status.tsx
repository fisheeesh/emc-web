import { Pie, PieChart, Cell } from "recharts"
import { FileText } from "lucide-react"

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

const chartConfig = {
    count: {
        label: "Action Plans",
    },
    pending: {
        label: "Pending",
        color: "var(--chart-5)",
    },
    approved: {
        label: "Approved",
        color: "var(--chart-2)",
    },
    rejected: {
        label: "Rejected",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function ActionPlanStatusChart({ chartData }: { chartData: ActionPlanStatus[] }) {
    const totalPlans = chartData.reduce((acc, curr) => acc + curr.count, 0)

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
                                    formatter={(value, name) => (
                                        <div className="flex items-center gap-2">
                                            <span className="capitalize">{name}:</span>
                                            <span className="font-en font-semibold">{value}</span>
                                            <span className="text-xs text-muted-foreground font-en">
                                                ({((Number(value) / totalPlans) * 100).toFixed(1)}%)
                                            </span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="status"
                            innerRadius={60}
                            outerRadius={90}
                            strokeWidth={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pb-6">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 font-en">
                            {chartData.find(d => d.status === 'pending')?.count}
                        </p>
                        <p className="text-xs text-gray-500 font-en">
                            {((chartData.find(d => d.status === 'pending')!.count! / totalPlans) * 100).toFixed(1)}%
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400 font-en">
                            {chartData.find(d => d.status === 'approved')?.count}
                        </p>
                        <p className="text-xs text-gray-500 font-en">
                            {((chartData.find(d => d.status === 'approved')!.count! / totalPlans) * 100).toFixed(1)}%
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rejected</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400 font-en">
                            {chartData.find(d => d.status === 'rejected')?.count}
                        </p>
                        <p className="text-xs text-gray-500 font-en">
                            {((chartData.find(d => d.status === 'rejected')!.count! / totalPlans) * 100).toFixed(1)}%
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}