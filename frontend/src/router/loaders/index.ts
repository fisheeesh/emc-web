import api, { authApi } from "@/api"
import queryClient, { adminUserDataQuery, attendanceOverviewQuery, checkInHoursQuery, countriesQuery, criticalQuery, dailyAttendanceQuery, departmentsQuery, leaderboardsQuery, moodOverviewQuery, notificationQuery, sentimentsComparisonQuery, watchlistQuery } from "@/api/query"
import useAuthStore, { Status } from "@/store/auth-store"
import { redirect } from "react-router"

export const homeLoader = async () => {
    try {
        const res = await api.get("admin/test")

        return res.data

    } catch (error) {
        console.log(error)
    }
}

export const senitmentsLoader = async () => {
    await Promise.all([
        queryClient.ensureQueryData(moodOverviewQuery()),
        queryClient.ensureQueryData(sentimentsComparisonQuery()),
        queryClient.ensureQueryData(departmentsQuery()),
        queryClient.ensureQueryData(adminUserDataQuery()),
        queryClient.ensureQueryData(leaderboardsQuery()),
        queryClient.ensureQueryData(notificationQuery()),
        queryClient.ensureInfiniteQueryData(criticalQuery()),
        queryClient.ensureInfiniteQueryData(watchlistQuery()),
        queryClient.ensureQueryData(countriesQuery())
    ])

    return null
}

export const attendanceLoader = async () => {
    await Promise.all([
        queryClient.ensureQueryData(dailyAttendanceQuery()),
        queryClient.ensureInfiniteQueryData(attendanceOverviewQuery()),
        queryClient.ensureQueryData(checkInHoursQuery())
    ])

    return null
}

export const loginLoader = async () => {
    try {
        const res = await authApi.get("auth-check")

        if (res.status !== 200) {
            return null
        }

        return redirect("/")
    } catch (error) {
        console.log(error)
        return null
    }
}

export const verifyOTPLoader = () => {
    const authStore = useAuthStore.getState()

    if (authStore.status !== Status.otp) {
        return redirect("/forgot-password")
    }

    return null
}

export const resetPasswordLoader = () => {
    const authStore = useAuthStore.getState()

    if (authStore.status !== Status.reset) {
        return redirect("/forgot-password")
    }

    return null
}