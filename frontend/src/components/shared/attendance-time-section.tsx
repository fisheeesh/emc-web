import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import { Clock, Calendar, TrendingUp, ClipboardList } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function AttendanceTimeSection({ data }: { data: WorkSchedule }) {
    const chartConfig = {
        count: {
            label: "Days",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    //* Check if there's any attendance data
    const hasAttendanceData = data.attendanceData && data.attendanceData.some(slot => slot.count > 0);
    const hasNoCheckIns = data.totalCheckIns === 0;

    return (
        <div className="mt-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4 border-b px-4 py-3">
                Work Schedule Pattern (Last <span className="font-en">30</span> Days)
            </h3>

            <div className="px-4 pb-6">
                {hasNoCheckIns ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No Work Schedule Data
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-lg">
                            This employee hasn't checked in during the last <span className="font-en">30</span> days.
                            Work schedule patterns will appear here once they start logging their check-ins.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Key Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Avg Start Time</p>
                                </div>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 font-en">
                                    {data.averageCheckIn}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Most Common</p>
                                </div>
                                <p className="text-base font-bold text-gray-900 dark:text-gray-100 font-en">
                                    {data.mostCommonTime}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-purple-600" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Earliest</p>
                                </div>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 font-en">
                                    {data.earliestCheckIn}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Latest</p>
                                </div>
                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 font-en">
                                    {data.latestCheckIn}
                                </p>
                            </div>
                        </div>

                        {/* Time Distribution Bar Chart */}
                        {hasAttendanceData ? (
                            <div className="mb-6">
                                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                                    <BarChart
                                        data={data.attendanceData}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                            top: 12,
                                            bottom: 12
                                        }}
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="timeSlot"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            style={{
                                                fontFamily: "Lato",
                                                fontSize: "12px"
                                            }}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            style={{
                                                fontFamily: "Lato",
                                                fontSize: "12px"
                                            }}
                                            label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
                                        />
                                        <ChartTooltip
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="rounded-lg border bg-background p-3 shadow-md">
                                                            <p className="text-sm font-semibold text-foreground font-en mb-1">
                                                                {data.timeSlot}
                                                            </p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                <span className="font-semibold font-en">{data.count}</span> days started work in this hour
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="count" fill="var(--color-count)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        ) : (
                            <div className="mb-6 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Not enough data to display time distribution chart
                                </p>
                            </div>
                        )}

                        {/* Insights */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Work Pattern Insights
                            </h4>
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                                {data.totalCheckIns > 0 ? (
                                    <>
                                        This employee prefers to start work around <span className="font-semibold font-en">{data.averageCheckIn}</span>,
                                        with most check-ins between <span className="font-semibold font-en">{data.mostCommonTime}</span>.
                                        Their schedule shows flexibility, ranging from <span className="font-semibold font-en">{data.earliestCheckIn}</span> to <span className="font-semibold font-en">{data.latestCheckIn}</span>.
                                        Total check-ins in the last <span className="font-en">30</span> days: <span className="font-semibold font-en">{data.totalCheckIns}</span>.
                                    </>
                                ) : (
                                    <>Limited work pattern data available. Encourage consistent check-ins for better insights.</>
                                )}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}