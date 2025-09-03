import { dailyAttendanceQuery } from "@/api/query";
import CheckInHourBarChart from "@/components/dashboard/charts/check-in-hour-bar-chart";
import DailyAttendanceChart from "@/components/dashboard/charts/daily-attendance-chart";
import DisplayCard from "@/components/dashboard/display-card";
import AttendanceTable from "@/components/dashboard/tables/attendance-table";
import useTitle from "@/hooks/use-title";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AttendanceDashboardPage() {
    useTitle("Attendance Dashboard")

    const { data: attendanceData } = useSuspenseQuery(dailyAttendanceQuery())

    return (
        <section className="flex flex-col justify-center items-center w-full gap-3">
            {/* Daily Attendance Cards */}
            <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-3">
                <div className="flex lg:flex-col gap-3 w-full lg:w-1/3">
                    <DisplayCard data={attendanceData.totalEmp} type='total' />
                    <DisplayCard data={attendanceData.totalPresent} type='present' />
                </div>
                {/* Daily Attendance Bar Chart */}
                <DailyAttendanceChart dataNum={attendanceData.data} dataPerc={attendanceData.percentages} />
            </div>

            <div className="w-full">
                <CheckInHourBarChart />
            </div>

            <div className="w-full">
                <AttendanceTable />
            </div>
        </section>
    )
}
