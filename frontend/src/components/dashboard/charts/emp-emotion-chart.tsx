import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

export default function EmpEmotionChart() {
    // Generate last 7 days emotion data
    const emotionChartData = [
        { date: "Oct 11", emotion: "positive" },
        { date: "Oct 12", emotion: "positive" },
        { date: "Oct 13", emotion: "positive" },
        { date: "Oct 14", emotion: "positive" },
        { date: "Oct 15", emotion: "neutral" },
        { date: "Oct 16", emotion: "positive" },
        { date: "Oct 17", emotion: "negative" },
        { date: "Oct 18", emotion: "neutral" },
        { date: "Oct 19", emotion: "positive" },
        { date: "Oct 20", emotion: "critical" },
    ];

    // Map emotions to numeric values for chart display
    const emotionValues: Record<string, number> = {
        critical: 1,
        negative: 2,
        neutral: 3,
        positive: 4
    };

    const chartData = emotionChartData.map(item => ({
        date: item.date,
        value: emotionValues[item.emotion],
        emotion: item.emotion
    }));

    const chartConfig = {
        value: {
            label: "Emotion",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    // Get emotion color
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
                                fontFamily: "Lato"
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
                            <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="value"
                            type="natural"
                            fill="url(#emotionGradient)"
                            stroke="var(--color-value)"
                        />
                    </AreaChart>
                </ChartContainer>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Critical</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-en">
                                {emotionChartData.filter(d => d.emotion === 'critical').length} days
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Negative</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-en">
                                {emotionChartData.filter(d => d.emotion === 'negative').length} days
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Neutral</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-en">
                                {emotionChartData.filter(d => d.emotion === 'neutral').length} days
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Positive</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-en">
                                {emotionChartData.filter(d => d.emotion === 'positive').length} days
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
