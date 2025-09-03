import { Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import DashboradRootLayout from './pages/dashboard/dashboard-root-layout'
import LoginPage from './pages/auth/login-page'
import NotFound from './pages/not-found/not-found'
import ForgetPassword from './pages/auth/forgot-password/forgot-password'
import VerifyOTP from './pages/auth/forgot-password/verify-otp'
import ResetPassword from './pages/auth/forgot-password/reset-password'
import { homeLoader, loginLoader, resetPasswordLoader, senitmentsLoader, verifyOTPLoader } from './router/loaders'
import { forgotPasswordAction, loginAction, resetPasswordAction, verifyOTPAction } from './router/actions'
import ErrorElement from './pages/not-found/error-element'

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
                        const { default: SentimentsDashboardPage } = await import('./pages/dashboard/sentiments')
                        return { Component: SentimentsDashboardPage }
                    },
                    loader: senitmentsLoader
                },
                {
                    path: '/dashboard/attendance',
                    lazy: async () => {
                        const { default: AttendanceDashboardPage } = await import('./pages/dashboard/attendance')
                        return { Component: AttendanceDashboardPage }
                    },
                    loader: homeLoader,
                },
                {
                    path: '/dashboard/managements',
                    lazy: async () => {
                        const { default: SettingsPage } = await import('./pages/dashboard/managements')
                        return { Component: SettingsPage }
                    },
                    loader: homeLoader,
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
        <Suspense fallback={<p>Loading...</p>}>
            <RouterProvider router={router} />
        </Suspense>
    )
}
