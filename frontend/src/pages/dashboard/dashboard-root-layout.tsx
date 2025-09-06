import { adminUserDataQuery, departmentsQuery } from "@/api/query";
import Loader from "@/components/shared/loader";
import Navbar from "@/components/shared/nav-bar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, useNavigation } from "react-router";

export default function DashboradRootLayout() {
    const navigation = useNavigation()

    const { data: departmentsData } = useSuspenseQuery(departmentsQuery())
    const { data: adminUserData } = useSuspenseQuery(adminUserDataQuery())

    if (navigation.state !== 'idle') {
        return <Loader />
    }

    return (
        <section>
            <Navbar departments={departmentsData.data} adminUser={adminUserData.data} />
            <div className="pt-20 md:pt-24 max-w-[1440px] mx-auto px-4 pb-5">
                <Outlet />
            </div>
        </section>
    )
}
