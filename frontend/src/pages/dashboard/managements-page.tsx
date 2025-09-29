import { allEmployeesQuery } from "@/api/super-admin-query"
import EmpTables from "@/components/dashboard/tables/emp-tables"
import useTitle from "@/hooks/use-title"
import { useSuspenseQuery } from "@tanstack/react-query"

export default function ManagementsPage() {
    useTitle("General Mangements")

    const { data: employeesData } = useSuspenseQuery(allEmployeesQuery())

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="w-full">
                <EmpTables data={employeesData.data} />
            </div>
        </section>
    )
}
