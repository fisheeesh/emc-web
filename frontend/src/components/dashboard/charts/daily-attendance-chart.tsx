import { useTheme } from "@/components/shared/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import type { ChartOptions } from "chart.js";

interface Props {
    dataNum: AttendanceData[],
    dataPerc: AttendanceData[]
}

export default function DailyAttendanceChart({ dataNum, dataPerc }: Props) {
    const { theme } = useTheme();
    const [todayFilter, setTodayFilter] = useState<"numbers" | "percentages">("numbers");
    const [labelRotation, setLabelRotation] = useState(window.innerWidth >= 768 ? 0 : 90);

    const isPercentages = todayFilter === "percentages";

    useEffect(() => {
        const handleResize = () => {
            setLabelRotation(window.innerWidth >= 768 ? 0 : 90);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const labels = dataNum.map((data) => data.checkInDate);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Attendance Rate",
                data: isPercentages
                    ? dataPerc.map(data => data.value)
                    : dataNum.map(data => data.value),
                backgroundColor: "#3b82f6",
                borderColor: "#3b82f6",
                borderWidth: 1,
                borderRadius: 5,
                barThickness: 35,
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label: function (context: any) {
                        return `Attendance: ${isPercentages
                            ? `${context.raw}%`
                            : `${context.raw} people`
                            }`;
                    },
                },
            },
        },
        interaction: { mode: "index", intersect: false },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    padding: 5,
                    align: "center",
                    autoSkip: false,
                    font: { size: 11, weight: "bold" },
                    color: theme === "dark" ? "#cbd5e1" : "",
                    maxRotation: labelRotation,
                    minRotation: labelRotation,
                },
            },
            y: {
                grid: {
                    display: true,
                    drawTicks: false,
                    color: theme === "dark" ? "#334155" : "#E0E0E0",
                },
                border: { display: false },
                ticks: {
                    font: { size: 11, weight: "bold" },
                    color: theme === "dark" ? "#cbd5e1" : "",
                    padding: 10,
                    stepSize: isPercentages ? 20 : 5,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    callback: (value: any) =>
                        isPercentages ? value + "%" : value,
                },
            },
        },
    };

    return (
        <Card className="w-full lg:w-2/3 h-[400px] rounded-md">
            <CardHeader className="flex justify-between flex-col md:flex-row gap-2">
                <div>
                    <CardTitle className="text-xl md:text-2xl">
                        Daily Attendance
                    </CardTitle>
                    <CardDescription>Monitor attendance rates and trends from the last 10 days</CardDescription>
                </div>
                <RadioGroup
                    value={todayFilter}
                    onValueChange={(v: "numbers" | "percentages") => setTodayFilter(v)}
                    className="flex items-center gap-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="numbers" id="numbers" />
                        <Label htmlFor="numbers">Numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentages" id="percentages" />
                        <Label htmlFor="percentages">Percentages</Label>
                    </div>
                </RadioGroup>
            </CardHeader>
            <CardContent className="w-full h-full">
                <Bar data={chartData} options={options} />
            </CardContent>
        </Card>
    );
}