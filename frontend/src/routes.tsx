import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import DashboradRootLayout from './pages/dashboard/dashboard-root-layout'
import DashboardPage from './pages/dashboard/dashboard-page'

export default function Router() {
    const router = createBrowserRouter([
        {
            path: "/",
            Component: DashboradRootLayout,
            children: [
                {
                    index: true,
                    Component: DashboardPage
                }
            ]
        },
        {
            path: '/login',
            lazy: async () => {
                const { default: LoginPage } = await import('./pages/auth/login-page')
                return { Component: LoginPage }
            }
        }
    ])

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <RouterProvider router={router} />
        </Suspense>
    )
}
