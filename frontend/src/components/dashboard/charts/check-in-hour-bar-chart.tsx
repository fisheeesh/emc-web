import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/shared/theme-provider";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import MonthYearSelector from "../month-year-selector";
import type { ChartOptions } from "chart.js";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CustomCalendar from "@/components/shared/custom-calendar";

const month = new Date(Date.now()).toLocaleString('en-US', { month: 'long' })
const year = new Date(Date.now()).getFullYear()

export default function CheckInHourBarChart({ data }: { data: CheckInHoursData[] }) {
    const [checkInFilter, setCheckInFilter] = useState<"daily" | "monthly" | "yearly">("daily");
    const { theme } = useTheme()
    const [activeMonth, setActiveMonth] = useState(month);
    const [activeYear, setActiveYear] = useState(year);

    const isActiveMonth = (month: string) => activeMonth === month;
    // const isActiveYear = (year: string) => activeYear.toString() === year;
    // const formattedDate = new Intl.DateTimeFormat('en-CA').format(date);

    const labels = data.map(att => att.checkInHour)
    const chartData = {
        labels,
        datasets: [
            {
                label: "Attendance Rate",
                data: data?.map(checkIn => checkIn.value),
                backgroundColor: "#3b82f6",
                borderColor: "#3b82f6",
                borderRadius: 5,
                barThickness: 15
            }
        ]
    }

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        interaction: {
            mode: "index",
            intersect: false
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    padding: 20,
                    align: "center",
                    autoSkip: false,
                    font: { size: 11, weight: "bold" },
                    color: theme === 'dark' ? '#cbd5e1' : ''
                },
                min: 0,
                max: 24
            },
            y: {
                grid: {
                    display: true,
                    drawTicks: false,
                    color: theme === 'dark' ? '#334155' : '#E0E0E0'
                },
                border: { display: false },
                ticks: {
                    font: { size: 11, weight: "bold" },
                    color: theme === 'dark' ? '#cbd5e1' : '',
                    padding: 10
                }
            }
        }
    }

    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="flex items-center justify-between flex-col md:flex-row gap-2">
                <div className="w-full lg:w-2/4">
                    <CardTitle className="text-xl md:text-2xl">Check-in Hours</CardTitle>
                    <CardDescription>Track the busiest check-in times across different periods</CardDescription>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-1/4 md:px-5">
                    <RadioGroup
                        value={checkInFilter}
                        onValueChange={(v: "daily" | "monthly" | "yearly") => setCheckInFilter(v)}
                        className="flex items-center gap-3"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="daily" id="daily" />
                            <Label htmlFor="daily">Daily</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label htmlFor="monthly">Monthly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yearly" id="yearly" />
                            <Label htmlFor="yearly">Yearly</Label>
                        </div>
                    </RadioGroup>
                </div>
            </CardHeader>
            <CardContent className="w-full flex flex-col-reverse xl:flex-row justify-center items-center gap-2 h-[700px] xl:h-[500px]">
                <div className="lg:w-3/4 w-full h-full overflow-x-scroll custom-scrollbar">
                    <div className="w-[1500px] h-full">
                        <Bar
                            data={chartData}
                            options={options}
                        />
                    </div>
                </div>
                <div className="lg:w-1/4 w-full px-5 h-fit lg:h-full mb-5 lg:mb-0 flex justify-center lg:justify-normal">
                    {checkInFilter === 'daily' &&
                        <CustomCalendar popover={false} filterValue="cIDate" />
                    }
                    {checkInFilter === 'monthly' && <MonthYearSelector mode={'month'} setActive={setActiveMonth} isActive={isActiveMonth} />}
                    {checkInFilter === 'yearly' && (
                        <MonthYearSelector
                            mode="year"
                            setActive={(el) => setActiveYear(Number(el))}
                            isActive={(el) => activeYear === Number(el)}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
