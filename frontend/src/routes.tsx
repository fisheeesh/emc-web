import { Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import Loader from './components/shared/loader'
import ForgetPassword from './pages/auth/forgot-password/forgot-password'
import ResetPassword from './pages/auth/forgot-password/reset-password'
import VerifyOTP from './pages/auth/forgot-password/verify-otp'
import LoginPage from './pages/auth/login-page'
import DashboradRootLayout from './pages/dashboard/dashboard-root-layout'
import ErrorElement from './pages/not-found/error-element'
import NotFound from './pages/not-found/not-found'
import { forgotPasswordAction, loginAction, resetPasswordAction, verifyOTPAction } from './router/actions'
import { attendanceLoader, loginLoader, resetPasswordLoader, senitmentsLoader, verifyOTPLoader } from './router/loaders'
import { managementsLoader } from './router/loaders/super-admin-loaders'

export default function Router() {
    const router = createBrowserRouter([
        {
            path: "/",
            Component: DashboradRootLayout,
            errorElement: <ErrorElement />,
            children: [
                {
                    index: true,
                    element: <Navigate to="/dashboard/sentiments" replace />,
                },
                {
                    path: 'dashboard',
                    element: <Navigate to="/dashboard/sentiments" replace />,
                },
                {
                    path: '/dashboard/sentiments',
                    lazy: async () => {
                        const { default: SentimentsDashboardPage } = await import('./pages/dashboard/sentiments-page')
                        return { Component: SentimentsDashboardPage }
                    },
                    loader: senitmentsLoader
                },
                {
                    path: '/dashboard/attendance',
                    lazy: async () => {
                        const { default: AttendanceDashboardPage } = await import('./pages/dashboard/attendance-page')
                        return { Component: AttendanceDashboardPage }
                    },
                    loader: attendanceLoader
                },
                {
                    path: '/dashboard/managements',
                    lazy: async () => {
                        const { default: SettingsPage } = await import('./pages/dashboard/managements-page')
                        return { Component: SettingsPage }
                    },
                    loader: managementsLoader
                }
            ]
        },
        {
            path: '/login',
            Component: LoginPage,
            loader: loginLoader,
            action: loginAction
        },
        {
            path: '/forgot-password',
            lazy: async () => {
                const { default: AuthRootLayout } = await import("@/pages/auth/forgot-password/auth-root-layout")
                return { Component: AuthRootLayout }
            },
            children: [
                {
                    index: true,
                    Component: ForgetPassword,
                    loader: loginLoader,
                    action: forgotPasswordAction,
                },
                {
                    path: 'verify-otp',
                    Component: VerifyOTP,
                    loader: verifyOTPLoader,
                    action: verifyOTPAction
                },
                {
                    path: 'reset-password',
                    Component: ResetPassword,
                    loader: resetPasswordLoader,
                    action: resetPasswordAction
                }
            ]
        },
        {
            path: '*',
            Component: NotFound
        }
    ])

    return (
        <Suspense fallback={<Loader />}>
            <RouterProvider router={router} />
        </Suspense>
    )
}
