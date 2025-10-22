import { departmentsQuery } from "@/api/query";
import Loader from "@/components/shared/loader";
import Navbar from "@/components/shared/nav-bar";
import useFilterStore from "@/store/filter-store";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Outlet, useNavigation } from "react-router";

export default function DashboradRootLayout() {
    const navigation = useNavigation()
    const { setFilters } = useFilterStore()

    const { data: departmentsData } = useQuery(departmentsQuery())

    useEffect(() => {
        if (departmentsData?.data) {
            setFilters({ departments: departmentsData.data })
        }
    }, [departmentsData, setFilters])

    if (navigation.state !== 'idle') {
        return <Loader />
    }

    return (
        <section>
            <Navbar />
            <div className="pt-20 md:pt-24 max-w-[1440px] mx-auto px-4 pb-5">
                <Outlet />
            </div>
        </section>
    )
}
