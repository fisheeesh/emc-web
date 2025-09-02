import CheckInHourBarChart from "@/components/dashboard/charts/check-in-hour-bar-chart";
import DailyAttendanceChart from "@/components/dashboard/charts/daily-attendance-chart";
import DisplayCard from "@/components/dashboard/display-card";
import AttendanceTable from "@/components/dashboard/tables/attendance-table";
import useTitle from "@/hooks/use-title";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AttendanceDashboardPage() {
    useTitle("Attendance Dashboard")

    return (
        <section className="flex flex-col justify-center items-center w-full gap-3">
            {/* Daily Attendance Cards */}
            <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-3">
                <div className="flex lg:flex-col gap-3 w-full lg:w-1/3">
                    <DisplayCard data={25} type='total' />
                    <DisplayCard data={23} type='present' />
                </div>
                {/* Daily Attendance Bar Chart */}
                <DailyAttendanceChart />
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
