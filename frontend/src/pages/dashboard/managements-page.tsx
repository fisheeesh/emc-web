import { empInfiniteQuery } from "@/api/super-admin-query"
import { ChartAreaInteractive } from "@/components/dashboard/charts/chart-interactive"
import { SectionCards } from "@/components/dashboard/section-cards"
import ActionsTable from "@/components/dashboard/tables/actions-table"
import EmpTables from "@/components/dashboard/tables/emp-tables"
import useTitle from "@/hooks/use-title"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"

export default function ManagementsPage() {
    useTitle("General Mangements")
    const [searchParams] = useSearchParams()

    const kw = searchParams.get("kw")
    const dep = searchParams.get("gDep")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const ts = searchParams.get("ts")
    const accType = searchParams.get("accType")
    const jobType = searchParams.get("jobType")

    const {
        status: empStatus,
        data: empData,
        error: empError,
        isFetching: isEmpFetching,
        isFetchingNextPage: isEmpFetchingNextPage,
        fetchNextPage: fetchEmpNextPage,
        hasNextPage: hasEmpNextPage,
    } = useInfiniteQuery(empInfiniteQuery(kw, dep, role, jobType, accType, status, ts))

    const allEmps = empData?.pages.flatMap(page => page.data) ?? []

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <SectionCards />
            <div className="w-full">
                <ChartAreaInteractive />
            </div>
            <div className="w-full">
                <EmpTables
                    data={allEmps}
                    status={empStatus}
                    error={empError}
                    isFetching={isEmpFetching}
                    isFetchingNextPage={isEmpFetchingNextPage}
                    fetchNextPage={fetchEmpNextPage}
                    hasNextPage={hasEmpNextPage}
                />
            </div>
            <div className="w-full">
                <ActionsTable />
            </div>
        </section>
    )
}
