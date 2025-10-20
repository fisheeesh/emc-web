import { MessageSquare } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

// Dummy data: Top concerns from textFeeling analysis
const concernsData = [
    { word: "workload", count: 48, size: 3 },
    { word: "stress", count: 42, size: 2.8 },
    { word: "deadline", count: 38, size: 2.6 },
    { word: "tired", count: 35, size: 2.4 },
    { word: "overwhelmed", count: 32, size: 2.2 },
    { word: "pressure", count: 28, size: 2 },
    { word: "burnout", count: 25, size: 1.8 },
    { word: "exhausted", count: 22, size: 1.6 },
    { word: "anxious", count: 20, size: 1.5 },
    { word: "unmotivated", count: 18, size: 1.4 },
    { word: "difficult", count: 16, size: 1.3 },
    { word: "frustrated", count: 15, size: 1.2 },
    { word: "team issues", count: 14, size: 1.2 },
    { word: "confused", count: 12, size: 1.1 },
    { word: "isolated", count: 10, size: 1 },
]

const getWordColor = (index: number) => {
    const colors = [
        'text-red-600 dark:text-red-400',
        'text-orange-600 dark:text-orange-400',
        'text-amber-600 dark:text-amber-400',
        'text-yellow-600 dark:text-yellow-500',
        'text-purple-600 dark:text-purple-400',
        'text-pink-600 dark:text-pink-400',
        'text-blue-600 dark:text-blue-400',
        'text-indigo-600 dark:text-indigo-400',
    ]
    return colors[index % colors.length]
}

export function TopConcernsWordCloud() {
    const totalMentions = concernsData.reduce((acc, curr) => acc + curr.count, 0)
    const topConcern = concernsData[0]
    const trendingConcerns = concernsData.slice(0, 3)

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    Top Employee Concerns
                </CardTitle>
                <CardDescription>
                    Most frequently mentioned keywords from emotion check-in notes
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Top Concern</p>
                        <p className="text-lg font-bold text-red-700 dark:text-red-400 capitalize">
                            {topConcern.word}
                        </p>
                        <p className="text-xs text-gray-500 font-en">{topConcern.count} mentions</p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Keywords</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 font-en">
                            {concernsData.length}
                        </p>
                        <p className="text-xs text-gray-500">tracked</p>
                    </div>

                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Mentions</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400 font-en">
                            {totalMentions}
                        </p>
                        <p className="text-xs text-gray-500">this month</p>
                    </div>
                </div>

                {/* Word Cloud Visualization */}
                <div className="relative min-h-[280px] border-2 border-dashed rounded-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex items-center justify-center">
                    <div className="flex flex-wrap gap-4 items-center justify-center max-w-2xl">
                        {concernsData.map((concern, index) => (
                            <div
                                key={concern.word}
                                className={`font-bold cursor-pointer hover:scale-110 transition-transform ${getWordColor(index)}`}
                                style={{
                                    fontSize: `${concern.size * 0.6}rem`,
                                    opacity: 0.7 + (concern.size / 10)
                                }}
                                title={`${concern.count} mentions`}
                            >
                                {concern.word}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top 3 Trending */}
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/30">
                    <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
                        🔥 Top 3 Trending Concerns
                    </h4>
                    <div className="space-y-2">
                        {trendingConcerns.map((concern, index) => (
                            <div key={concern.word} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-orange-700 dark:text-orange-400 font-en">
                                        #{index + 1}
                                    </span>
                                    <span className="capitalize font-medium text-gray-700 dark:text-gray-300">
                                        {concern.word}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500"
                                            style={{ width: `${(concern.count / topConcern.count) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 font-en min-w-[3rem] text-right">
                                        {concern.count} times
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insight */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                        💡 <span className="font-semibold">"{topConcern.word}"</span> is mentioned most frequently (<span className="font-en font-semibold">{topConcern.count}</span> times). Consider addressing workload distribution and resource allocation to improve employee wellbeing.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}