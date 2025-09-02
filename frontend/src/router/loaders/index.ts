import api, { authApi } from "@/api"
import useAuthStore, { Status } from "@/store/auth-store"
import { redirect } from "react-router"

export const homeLoader = async () => {
    try {
        const res = api.get("admin/test")

        return res

    } catch (error) {
        console.log(error)
    }
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