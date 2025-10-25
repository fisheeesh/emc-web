import { Clock, Lightbulb } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import Empty from "@/components/ui/empty"

const chartConfig = {
    responseTime: {
        label: "Response Time (hours)",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function ResponseTimeChart({ chartData }: { chartData: AvgResponseTime[] }) {
    const validData = chartData.filter(dept => dept.responseTime > 0)
    const hasValidData = validData.length > 0

    if (!hasValidData) {
        return (
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                        <Clock className="size-5" />
                        Average Response Time
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                        Time from critical alert to action plan creation by department
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center max-w-xs sm:max-w-sm md:max-w-md mx-auto justify-center py-8">
                        <Empty label="No response time data available yet. Create action plans for critical employees to see metrics here." />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const avgResponseTime = (validData.reduce((acc, curr) => acc + curr.responseTime, 0) / validData.length).toFixed(1)
    const fastestDept = validData.reduce((min, dept) => dept.responseTime < min.responseTime ? dept : min)
    const slowestDept = validData.reduce((max, dept) => dept.responseTime > max.responseTime ? dept : max)

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <Clock className="size-5" />
                    Average Response Time
                </CardTitle>
                <CardDescription className="line-clamp-1">
                    Time from critical alert to action plan creation by department
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Overall Avg</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 font-en">
                            {avgResponseTime}h
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Fastest</p>
                        <p className="text-lg font-bold text-green-700 dark:text-green-400 font-en">
                            {fastestDept.responseTime}h
                        </p>
                        <p className="text-xs text-gray-500 truncate w-full text-center">
                            {fastestDept.department}
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Slowest</p>
                        <p className="text-lg font-bold text-orange-700 dark:text-orange-400 font-en">
                            {slowestDept.responseTime}h
                        </p>
                        <p className="text-xs text-gray-500 truncate w-full text-center">
                            {slowestDept.department}
                        </p>
                    </div>
                </div>

                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="department"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            style={{
                                fontFamily: "Raleway",
                                fontSize: "11px"
                            }}
                            angle={-15}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            style={{
                                fontFamily: "Open Sans",
                                fontSize: "12px"
                            }}
                            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                        />
                        <ChartTooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => (
                                        <span className="font-en">{Number(value).toFixed(1)} hours</span>
                                    )}
                                />
                            }
                        />
                        <Bar
                            dataKey="responseTime"
                            fill="var(--color-responseTime)"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>

                <div className="mt-4 p-3 flex items-center gap-2 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
                    <Lightbulb className="size-3.5 text-yellow-500" />
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{fastestDept.department}</span> responds fastest with an average of <span className="font-en font-semibold">{fastestDept.responseTime}h</span>, while <span className="font-semibold">{slowestDept.department}</span> may need process improvements.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}