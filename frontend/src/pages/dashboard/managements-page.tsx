import { actionPlansQuery, countriesQuery, empInfiniteQuery, summaryDataQuery } from "@/api/super-admin-query"
import { SectionCards } from "@/components/dashboard/section-cards"
import ActionsTable from "@/components/dashboard/tables/actions-table"
import EmpTables from "@/components/dashboard/tables/emp-tables"
import { ActionPlanStatusChart } from "@/components/temp/actoin-plan-status"
import { DepartmentHeatmap } from "@/components/temp/dep-heat-map"
import { ResponseTimeChart } from "@/components/temp/response-time-chart"
import { TopConcernsWordCloud } from "@/components/temp/top-concern-words"
import useTitle from "@/hooks/ui/use-title"
import useCountryStore from "@/store/country-store"
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { useSearchParams } from "react-router"

export default function ManagementsPage() {
    useTitle("General Mangements")
    const [searchParams] = useSearchParams()
    const { setCountries } = useCountryStore()

    const kw = searchParams.get("kw")
    const dep = searchParams.get("gDep")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const ts = searchParams.get("ts")
    const accType = searchParams.get("accType")
    const jobType = searchParams.get("jobType")

    const rKw = searchParams.get("rKw")
    const priority = searchParams.get("priority")
    const rStatus = searchParams.get("rStatus")
    const rType = searchParams.get("rType")
    const rTs = searchParams.get("rTs")

    const {
        status: empStatus,
        data: empData,
        error: empError,
        isFetching: isEmpFetching,
        isFetchingNextPage: isEmpFetchingNextPage,
        fetchNextPage: fetchEmpNextPage,
        hasNextPage: hasEmpNextPage,
    } = useInfiniteQuery(empInfiniteQuery(kw, dep, role, jobType, accType, status, ts))

    const {
        status: actionStatus,
        data: actionData,
        error: actionError,
        isFetching: isActionFetching,
        isFetchingNextPage: isActionFetchingNextPage,
        fetchNextPage: fetchActionNextPage,
        hasNextPage: hasActionNextPage,
    } = useInfiniteQuery(actionPlansQuery(rKw, dep, priority, rStatus, rType, rTs))

    const { data: summaryData } = useSuspenseQuery(summaryDataQuery(dep))
    const { data: countriesData } = useSuspenseQuery(countriesQuery())

    const allEmps = empData?.pages.flatMap(page => page.data) ?? []
    const allActionPlans = actionData?.pages.flatMap(page => page.data) ?? []

    useEffect(() => {

        if (countriesData) {
            setCountries(countriesData.map((country: Country) => ({
                name: country.name,
                value: country.name
            })))
        }
    }, [countriesData, setCountries])

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <SectionCards data={summaryData.data} />
            <div className="w-full">
                <DepartmentHeatmap />
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
                <ActionsTable
                    data={allActionPlans}
                    status={actionStatus}
                    error={actionError}
                    isFetching={isActionFetching}
                    isFetchingNextPage={isActionFetchingNextPage}
                    fetchNextPage={fetchActionNextPage}
                    hasNextPage={hasActionNextPage}
                />
            </div>
            <div className="w-full">
                <TopConcernsWordCloud />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <ResponseTimeChart />
                <ActionPlanStatusChart />
            </div>
        </section>
    )
}
