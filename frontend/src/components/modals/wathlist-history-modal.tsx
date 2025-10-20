import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, Download, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Props {
    empName: string
}

export default function WatchlistHistoryModal({ empName }: Props) {
    // Last 5 days emotion tracking data
    const emotionData = [
        { date: "Oct 16", emotion: "critical", value: 1 },
        { date: "Oct 17", emotion: "negative", value: 2 },
        { date: "Oct 18", emotion: "neutral", value: 3 },
        { date: "Oct 19", emotion: "neutral", value: 3 },
        { date: "Oct 20", emotion: "positive", value: 4 },
    ];

    // Check if employee is recovering (last 5 days all neutral or positive)
    const isRecovering = emotionData.every(d => d.value >= 3);
    const hasImprovement = emotionData[emotionData.length - 1].value > emotionData[0].value;

    const chartConfig = {
        value: {
            label: "Emotion",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    const getEmotionColor = (emotion: string) => {
        const colors: Record<string, string> = {
            critical: '#ef4444',
            negative: '#f97316',
            neutral: '#a855f7',
            positive: '#22c55e'
        };
        return colors[emotion] || colors.neutral;
    };

    const getGradientColor = () => {
        if (isRecovering) return '#22c55e';
        if (hasImprovement) return '#3b82f6';
        return '#f97316';
    };

    return (
        <DialogContent className="w-full mx-auto max-h-[95vh] overflow-visible sm:max-w-[1200px] lg:px-8">
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">
                <DialogHeader className="flex flex-col md:flex-row items-start justify-between space-y-0 pb-5 border-b">
                    <div className="space-y-1.5">
                        <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                            <Activity className="text-blue-600 size-5 md:size-7" />
                            Watchlist Recovery Tracking - {empName || 'Employee'}
                        </DialogTitle>
                        <DialogDescription className="text-xs md:text-sm">
                            Monitor emotional wellbeing progress for this employee after HR intervention.
                            {isRecovering && <span className="text-green-600 font-semibold ml-1">Ready for removal from watchlist!</span>}
                        </DialogDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="cursor-pointer shrink-0 mr-5"
                        onClick={() => console.log('Download PDF clicked')}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Status Alert */}
                    <div className={`p-4 rounded-lg border ${isRecovering
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30'
                        : hasImprovement
                            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30'
                            : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30'
                        }`}>
                        <div className="flex items-start gap-3">
                            <TrendingUp className={`w-5 h-5 mt-0.5 ${isRecovering
                                ? 'text-green-600'
                                : hasImprovement
                                    ? 'text-blue-600'
                                    : 'text-orange-600'
                                }`} />
                            <div>
                                <h4 className="font-semibold text-sm mb-1">
                                    {isRecovering
                                        ? 'Recovery Complete'
                                        : hasImprovement
                                            ? 'Showing Improvement'
                                            : 'Requires Continued Monitoring'}
                                </h4>
                                <p className="text-xs text-gray-700 dark:text-gray-300">
                                    {isRecovering
                                        ? 'All emotions in the last 5 days are neutral or positive. This employee can be removed from the watchlist.'
                                        : hasImprovement
                                            ? 'Emotional state is improving. Continue monitoring progress over the next few days.'
                                            : 'Emotional state requires attention. Consider additional support or follow-up actions.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Status</p>
                            <p className="text-lg font-bold capitalize" style={{ color: getEmotionColor(emotionData[emotionData.length - 1].emotion) }}>
                                {emotionData[emotionData.length - 1].emotion}
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Initial Status</p>
                            <p className="text-lg font-bold capitalize" style={{ color: getEmotionColor(emotionData[0].emotion) }}>
                                {emotionData[0].emotion}
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Positive Days</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 font-en">
                                {emotionData.filter(d => d.emotion === 'positive').length}/5
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tracking Days</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 font-en">
                                {emotionData.length}
                            </p>
                        </div>
                    </div>

                    {/* Emotion Tracking Chart */}
                    <div className="border rounded-lg p-4">
                        <h3 className="text-base font-semibold mb-4">
                            Last <span className="font-en">5</span> Days Emotion Recovery Progress
                        </h3>

                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <AreaChart
                                data={emotionData}
                                margin={{
                                    left: 12,
                                    right: 12,
                                    top: 12,
                                    bottom: 12
                                }}
                            >
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    style={{
                                        fontFamily: "Lato",
                                        fontSize: "12px"
                                    }}
                                />
                                <YAxis
                                    domain={[0, 5]}
                                    ticks={[1, 2, 3, 4]}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    style={{
                                        fontFamily: "Lato",
                                        fontSize: "12px"
                                    }}
                                    tickFormatter={(value) => {
                                        const labels: Record<number, string> = {
                                            1: 'Critical',
                                            2: 'Negative',
                                            3: 'Neutral',
                                            4: 'Positive'
                                        };
                                        return labels[value] || '';
                                    }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="rounded-lg border bg-background p-3 shadow-md">
                                                    <p className="text-sm font-semibold text-foreground font-en">{data.date}</p>
                                                    <p className="text-sm capitalize font-semibold" style={{ color: getEmotionColor(data.emotion) }}>
                                                        {data.emotion}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <defs>
                                    <linearGradient id="recoveryGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getGradientColor()} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={getGradientColor()} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    dataKey="value"
                                    type="monotone"
                                    fill="url(#recoveryGradient)"
                                    stroke={getGradientColor()}
                                />
                            </AreaChart>
                        </ChartContainer>

                        {/* Legend */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 mb-2">
                            <div className="flex items-center justify-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-gray-600 dark:text-gray-400">Critical</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span className="text-gray-600 dark:text-gray-400">Negative</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="text-gray-600 dark:text-gray-400">Neutral</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-gray-600 dark:text-gray-400">Positive</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Recommendation */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Recommended Actions
                        </h4>
                        <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                            {isRecovering ? (
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Employee shows consistent positive/neutral emotions - ready to be removed from watchlist</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Schedule a final check-in meeting to confirm wellbeing status</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>Document the recovery process for future reference</span>
                                    </li>
                                </>
                            ) : hasImprovement ? (
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">→</span>
                                        <span>Continue monitoring for <span className="font-en">2-3</span> more days to ensure sustained improvement</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">→</span>
                                        <span>Conduct a brief check-in to assess support needs</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">→</span>
                                        <span>If improvement continues, prepare for watchlist removal</span>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-0.5">!</span>
                                        <span>Schedule immediate follow-up meeting with HR and manager</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-0.5">!</span>
                                        <span>Review and potentially adjust support plan</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-0.5">!</span>
                                        <span>Consider additional resources or professional support</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
}