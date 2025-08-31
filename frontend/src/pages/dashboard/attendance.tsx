import DisplayCard from "@/components/dashboard/display-card"
import useTitle from "@/hooks/useTitle"

export default function AttendanceDashboardPage() {
    useTitle("Attendance Dashboard")

    return (
        <section className="flex flex-col justify-center items-center w-full gap-3">
            <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-3 lg:h-[343px]">
                <div className="flex lg:flex-col gap-3 w-full lg:w-1/3">
                    <DisplayCard data={25} type='total' />
                    <DisplayCard data={23} type='present' />
                </div>
            </div>
        </section>
    )
}
