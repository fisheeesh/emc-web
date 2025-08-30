import { Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import DashboradRootLayout from './pages/dashboard/dashboard-root-layout'
import LoginPage from './pages/auth/login-page'

export default function Router() {
    const router = createBrowserRouter([
        {
            path: "/",
            Component: DashboradRootLayout,
            children: [
                {
                    index: true,
                    element: <Navigate to="/dashboard/sentiments" replace />,
                },
                {
                    path: '/dashboard/sentiments',
                    lazy: async () => {
                        const { default: SentimentsDashboardPage } = await import('./pages/dashboard/sentiments')
                        return { Component: SentimentsDashboardPage }
                    }
                },
                {
                    path: '/dashboard/attendance',
                    lazy: async () => {
                        const { default: AttendanceDashboardPage } = await import('./pages/dashboard/attendance')
                        return { Component: AttendanceDashboardPage }
                    }
                },
                {
                    path: '/dashboard/settings',
                    lazy: async () => {
                        const { default: SettingsPage } = await import('./pages/dashboard/settings')
                        return { Component: SettingsPage }
                    }
                }
            ]
        },
        {
            path: '/login',
            Component: LoginPage
        }
    ])

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <RouterProvider router={router} />
        </Suspense>
    )
}
