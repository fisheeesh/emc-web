import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Calendar } from 'lucide-react';

interface Props {
    emotionChartData: CheckIn[]
}

export default function EmpEmotionChart({ emotionChartData }: Props) {
    const emotionValues: Record<string, number> = {
        critical: 1,
        negative: 2,
        neutral: 3,
        positive: 4
    };

    //* Filter out null emotions for chart display
    const validEmotions = emotionChartData.filter(item => item.emotion !== null);
    const hasData = validEmotions.length > 0;

    const chartData = emotionChartData.map(item => ({
        date: item.date,
        value: item.emotion ? emotionValues[item.emotion] : null,
        emotion: item.emotion
    }));

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

    return (
        <div className="mt-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4 border-b px-4 py-3">Last <span className="font-en">10</span> days Emotion Overview</h3>
            <div className="px-4 pb-6">
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Check-in Data Available
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-lg">
                            This employee hasn't submitted any emotion check-ins in the last <span className="font-en">10</span> days.
                            Encourage them to use the daily check-in feature to track their wellbeing.
                        </p>
                    </div>
                ) : (
                    <>
                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                            <AreaChart
                                accessibilityLayer
                                data={chartData}
                                margin={{
                                    left: 12,
                                    right: 12,
                                    top: 12,
                                    bottom: 12
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    style={{
                                        fontFamily: "Open Sans",
                                    }}
                                />
                                <YAxis
                                    domain={[0, 5]}
                                    ticks={[1, 2, 3, 4]}
                                    tickFormatter={(value) => {
                                        const labels: Record<number, string> = {
                                            1: 'Critical',
                                            2: 'Negative',
                                            3: 'Neutral',
                                            4: 'Positive'
                                        };
                                        return labels[value] || '';
                                    }}
                                    tickLine={false}
                                    axisLine={false}
                                    style={{
                                        fontFamily: "Open Sans",
                                        fontSize: "12px"
                                    }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            if (!data.emotion) return null;
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
                                    <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    dataKey="value"
                                    type="natural"
                                    fill="url(#emotionGradient)"
                                    stroke="var(--color-value)"
                                    connectNulls={false}
                                />
                            </AreaChart>
                        </ChartContainer>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Critical</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-en">
                                        {validEmotions.filter(d => d.emotion === 'critical').length} days
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Negative</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-en">
                                        {validEmotions.filter(d => d.emotion === 'negative').length} days
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Neutral</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-en">
                                        {validEmotions.filter(d => d.emotion === 'neutral').length} days
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Positive</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-en">
                                        {validEmotions.filter(d => d.emotion === 'positive').length} days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}