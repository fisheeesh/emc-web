import CheckInHourBarChart from "@/components/dashboard/charts/check-in-hour-bar-chart";
import DailyAttendanceChart from "@/components/dashboard/charts/daily-attendance-chart";
import DisplayCard from "@/components/dashboard/display-card";
import AttendanceTable from "@/components/dashboard/tables/attendance-table";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useTitle from "@/hooks/useTitle";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { useState } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AttendanceDashboardPage() {
    useTitle("Attendance Dashboard")
    const [checkInFilter, setCheckInFilter] = useState<"daily" | "monthly" | "yearly">("daily");

    return (
        <section className="flex flex-col justify-center items-center w-full gap-3">
            {/* Daily Attendance Cards */}
            <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-3 lg:h-[343px]">
                <div className="flex lg:flex-col gap-3 w-full lg:w-1/3">
                    <DisplayCard data={25} type='total' />
                    <DisplayCard data={23} type='present' />
                </div>
                {/* Daily Attendance Bar Chart */}
                <DailyAttendanceChart />
            </div>

            <div className="w-full">
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
                    <CheckInHourBarChart filter={checkInFilter} />
                </Card>
            </div>

            <div className="w-full">
                <AttendanceTable />
            </div>
        </section>
    )
}
