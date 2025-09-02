import EmpTables from "@/components/dashboard/tables/emp-tables"
import useTitle from "@/hooks/use-title"

export default function ManagementsPage() {
    useTitle("General Mangements")

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="w-full">
                <EmpTables />
            </div>
        </section>
    )
}
