import { adminUserDataQuery, departmentsQuery } from "@/api/query";
import Loader from "@/components/shared/loader";
import Navbar from "@/components/shared/nav-bar";
import useFilterStore from "@/store/filter-store";
import useUserStore from "@/store/user-store";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Outlet, useNavigation } from "react-router";

export default function DashboradRootLayout() {
    const navigation = useNavigation()
    const { setFilters } = useFilterStore()
    const { setUser } = useUserStore()

    const { data: departmentsData } = useQuery(departmentsQuery())
    const { data: adminUserData } = useSuspenseQuery(adminUserDataQuery())

    useEffect(() => {
        if (departmentsData?.data) {
            setFilters({ departments: departmentsData.data })
        }

        if (adminUserData) {
            setUser({
                id: adminUserData.data.id,
                fullName: adminUserData.data.fullName,
                email: adminUserData.data.email,
                avatar: adminUserData.data.avatar,
                role: adminUserData.data.role,
                departmentId: adminUserData.data.departmentId
            })
        }
    }, [departmentsData, setFilters, adminUserData, setUser])

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
