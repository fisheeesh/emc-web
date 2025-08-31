import EmpTables from "@/components/dashboard/tables/emp-tables"
import useTitle from "@/hooks/useTitle"

export default function SettingsPage() {
    useTitle("General Settings")

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="w-full">
                <EmpTables />
            </div>
        </section>
    )
}
