import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, Download, Activity, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface Props {
    empName: string,
    emotionHistory: EmotionHistory[]
}

export default function WatchlistHistoryModal({ empName, emotionHistory }: Props) {

    //* Check if we have emotion data
    const hasData = emotionHistory && emotionHistory.length > 0;

    //* Check if employee is recovering (all emotions are neutral or positive)
    const isRecovering = hasData && emotionHistory.every(d => d.value >= -0.5);
    const hasImprovement = hasData && emotionHistory.length >= 3 &&
        emotionHistory[emotionHistory.length - 1]?.value > emotionHistory[0]?.value;

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
                        <DialogDescription className="text-xs md:text-sm text-start">
                            Monitor emotional wellbeing progress after HR intervention action plan.
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
                    {/* No Data Alert */}
                    {!hasData && (
                        <div className="p-6 rounded-lg border bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 mt-0.5 text-gray-600" />
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">No Check-in Data Available</h4>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">
                                        This employee hasn't checked in yet since the action plan was implemented.
                                        Emotion tracking will begin once they submit their first check-in after the action plan date.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Alert */}
                    {hasData && (
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
                                            ? 'All check-in emotions after the action plan are neutral or positive. This employee can be removed from the watchlist.'
                                            : hasImprovement
                                                ? 'Emotional state is improving since the action plan. Continue monitoring progress.'
                                                : 'Emotional state requires attention. Consider additional support or follow-up actions.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Key Metrics */}
                    {hasData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Latest Status</p>
                                <p className="text-lg font-bold capitalize" style={{ color: getEmotionColor(emotionHistory[emotionHistory.length - 1]?.emotion) }}>
                                    {emotionHistory[emotionHistory.length - 1]?.emotion}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">First Status</p>
                                <p className="text-lg font-bold capitalize" style={{ color: getEmotionColor(emotionHistory[0]?.emotion) }}>
                                    {emotionHistory[0]?.emotion}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Positive Days</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 font-en">
                                    {emotionHistory.filter(d => d.emotion === 'positive')?.length}/{emotionHistory.length}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Check-ins Tracked</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 font-en">
                                    {emotionHistory.length} / 4
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Emotion Tracking Chart */}
                    {hasData && (
                        <div className="border rounded-lg p-4">
                            <h3 className="text-base font-semibold mb-4">
                                Emotion Progress After Action Plan
                            </h3>

                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <AreaChart
                                    data={emotionHistory}
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
                                        connectNulls={false}
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
                    )}

                    {/* Action Recommendation */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Recommended Actions
                        </h4>
                        <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                            {!hasData ? (
                                <>
                                    <li className="flex items-start gap-2">
                                        <span className="text-gray-600 mt-0.5">→</span>
                                        <span>Wait for employee to submit their first check-in after the action plan</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-gray-600 mt-0.5">→</span>
                                        <span>Send a reminder to encourage daily check-ins for better tracking</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-gray-600 mt-0.5">→</span>
                                        <span>Follow up with the employee directly to ensure they know about the check-in system</span>
                                    </li>
                                </>
                            ) : isRecovering ? (
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
                                        <span>Continue monitoring until all <span className="font-en">4</span> check-ins are completed to ensure sustained improvement</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-0.5">→</span>
                                        <span>Conduct a brief check-in to assess ongoing support needs</span>
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
                                        <span>Review and potentially adjust the current action plan</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-0.5">!</span>
                                        <span>Consider additional resources or professional mental health support</span>
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