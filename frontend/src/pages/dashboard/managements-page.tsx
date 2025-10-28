import { actionPlansQuery, allDepartmentsDataQuery, allEmotionCategoriesQuery, countriesQuery, empInfiniteQuery, summaryDataQuery, systemSettingsQuery } from "@/api/super-admin-query"
import EmotionDisplay from "@/components/dashboard/emotion-display-card"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import SystemSettingsCard from "@/components/dashboard/system-settings-card"
import ActionsTable from "@/components/dashboard/tables/actions-table"
import DepartmentTable from "@/components/dashboard/tables/dep-table"
import EmpTables from "@/components/dashboard/tables/emp-tables"
import useTitle from "@/hooks/ui/use-title"
import useCountryStore from "@/store/country-store"
import { useInfiniteQuery, useIsFetching, useSuspenseQuery } from "@tanstack/react-query"
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
    const { data: allDepData } = useSuspenseQuery(allDepartmentsDataQuery())
    const { data: allEmotionCate } = useSuspenseQuery(allEmotionCategoriesQuery())
    const { data: systemSettings } = useSuspenseQuery(systemSettingsQuery())

    console.log(systemSettings)

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

    const isSummaryRefetching = useIsFetching({
        queryKey: ['summary'],
    }) > 0

    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <SummaryCards data={summaryData.data} isLoading={isSummaryRefetching} />
            <SystemSettingsCard data={systemSettings.data} />
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
                <DepartmentTable data={allDepData.data} />
                <EmotionDisplay data={allEmotionCate.data} />
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
            <div id="action_table" className="w-full">
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
        </section>
    )
}
