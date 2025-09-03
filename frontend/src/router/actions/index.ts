import { authApi } from "@/api"
import useAuthStore, { Status } from "@/store/auth-store"
import { AxiosError } from "axios"
import { redirect, type ActionFunctionArgs } from "react-router"

export const loginAction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData()
    const credentials = Object.fromEntries(formData)

    try {
        const res = await authApi.post("login", credentials)

        if (res.status !== 200) {
            return {
                error: res.data || "Login failed. Please try again."
            }
        }

        //* Get redirect parameter from current page URL, not form submission URL
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get("redirect") || "/dashboard/sentiments"
        return redirect(redirectTo)

    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { error: "Something went wrong. Please try again" }
        }
        throw error
    }
}

export const forgotPasswordAction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData()
    const credentials = Object.fromEntries(formData)
    const authStore = useAuthStore.getState()

    try {
        const res = await authApi.post("forgot-password", credentials)

        if (res.status !== 200) {
            return {
                error: res.data || "Something went wrong!"
            }
        }

        authStore.setAuth(res.data.email, res.data.token, Status.otp)

        return redirect('/forgot-password/verify-otp')
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { error: "Something went wrong. Please try again" }
        }
        throw error
    }
}

export const verifyOTPAction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData()
    const authStore = useAuthStore.getState()

    const data = {
        email: authStore.email,
        token: authStore.token,
        otp: formData.get("otp")
    }

    try {
        const res = await authApi.post("verity-otp-forgot", data)

        if (res.status !== 200) {
            return {
                error: res.data || "Reseting password failed"
            }
        }

        authStore.setAuth(res.data.email, res.data.token, Status.reset)

        return redirect('/forgot-password/reset-password')
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { error: "Something went wrong. Please try again" }
        }
        throw error
    }
}

export const resetPasswordAction = async ({ request }: ActionFunctionArgs) => {
    const authStore = useAuthStore.getState()
    const formData = await request.formData()
    const data = {
        email: authStore.email,
        token: authStore.token,
        password: formData.get("password")
    }

    try {
        const res = await authApi.post("reset-password", data)

        if (res.status !== 200) {
            return {
                error: res.data || "Something went wrong. Please try again."
            }
        }

        authStore.clearAuth()
        return redirect('/')
    } catch (error) {
        if (error instanceof AxiosError) {
            return error.response?.data || { error: "Something went wrong. Please try again" }
        }

        throw error
    }
}