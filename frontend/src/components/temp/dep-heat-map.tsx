import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { BsBuildings } from "react-icons/bs"

const getStatusColor = (status: string) => {
    const colors = {
        positive: 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-900 dark:text-green-300',
        neutral: 'bg-purple-100 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-300',
        negative: 'bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-300',
        critical: 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-900 dark:text-red-300',
    }
    return colors[status as keyof typeof colors] || colors.neutral
}

const getStatusIcon = (status: string) => {
    if (status === 'positive') return <CheckCircle className="size-4" />
    if (status === 'critical' || status === 'negative') return <AlertCircle className="size-4" />
    return null
}

const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="size-3 text-green-600 dark:text-green-400" />
    if (trend === 'down') return <TrendingUp className="size-3 text-red-600 dark:text-red-400 rotate-180" />
    return <span className="text-gray-400">—</span>
}

export function DepartmentHeatmap({ depHeatmapData }: { depHeatmapData: DepHeatMap[] }) {
    const criticalCount = depHeatmapData.filter(d => d.status === 'critical').length
    const positiveCount = depHeatmapData.filter(d => d.status === 'positive').length
    const avgOverall = (depHeatmapData.reduce((acc, curr) => acc + curr.avgScore, 0) / depHeatmapData.length).toFixed(2)

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <BsBuildings />
                    Departments Wellbeing Heatmap
                </CardTitle>
                <CardDescription>
                    Real-time wellbeing status across all departments based on the last <span className="font-en">3</span> months of data
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Overall Avg</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 font-en">
                            {avgOverall}
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Positive</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400 font-en">
                            {positiveCount}
                        </p>
                        <p className="text-xs text-gray-500">departments</p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Critical</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400 font-en">
                            {criticalCount}
                        </p>
                        <p className="text-xs text-gray-500">departments</p>
                    </div>
                </div>

                {/* Heatmap Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {depHeatmapData.map((dept) => (
                        <div
                            key={dept.name}
                            className={`p-4 rounded-lg border-2 ${getStatusColor(dept.status)}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(dept.status)}
                                    <h3 className="font-semibold text-sm truncate">
                                        {dept.name}
                                    </h3>
                                </div>
                                {getTrendIcon(dept.trend)}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold font-en">
                                        {dept.avgScore.toFixed(1)}
                                    </span>
                                    <span className="text-xs opacity-70 font-en">/1.0</span>
                                </div>

                                <div className="flex items-center justify-between text-xs opacity-80">
                                    <span className="font-en">{dept.employees} employees</span>
                                    <span className="capitalize font-semibold">{dept.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Positive <span className="font-en">(0.4 ↔ 1.0)</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Neutral <span className="font-en">(-0.3 ↔ 0.3)</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Negative <span className="font-en">(-0.7 ↔ -0.4)</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Critical <span className="font-en">(&gt;-0.8)</span></span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}