import { attendanceOverviewQuery, checkInHoursQuery, dailyAttendanceQuery } from "@/api/query";
import CheckInHourBarChart from "@/components/dashboard/charts/check-in-hour-bar-chart";
import DailyAttendanceChart from "@/components/dashboard/charts/daily-attendance-chart";
import DisplayCard from "@/components/dashboard/display-card";
import AttendanceTable from "@/components/dashboard/tables/attendance-table";
import useTitle from "@/hooks/use-title";
import useUserStore from "@/store/user-store";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { useSearchParams } from "react-router";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AttendanceDashboardPage() {
    useTitle("Attendance Dashboard")

    const { user } = useUserStore()
    const [searchParams] = useSearchParams()

    const gDep = searchParams.get('gDep') || 'all'
    const kw = searchParams.get('kw')
    const ts = searchParams.get('ts')
    const empStatus = searchParams.get('empStatus') || "all"
    const attDate = searchParams.get('attDate')
    const ciDate = searchParams.get('ciDate')
    const ciMonth = searchParams.get('ciMonth')
    const ciYear = searchParams.get('ciYear')

    const dep = user?.role === 'SUPERADMIN' ? gDep : user?.departmentId.toString()

    const { data: attendanceData } = useSuspenseQuery(dailyAttendanceQuery(dep))
    const { data: attendanceOverviewData } = useSuspenseQuery(attendanceOverviewQuery(kw, empStatus, attDate, dep, ts))
    const { data: checkInHoursData } = useSuspenseQuery(checkInHoursQuery(ciDate, ciMonth, ciYear, dep))

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
                <CheckInHourBarChart data={checkInHoursData.data} />
            </div>

            <div className="w-full">
                <AttendanceTable data={attendanceOverviewData.data} />
            </div>
        </section>
    )
}
