import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './routes'
import { ThemeProvider } from "@/components/shared/theme-provider"
import { Toaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './api/query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Router />
            <Toaster richColors />
        </ThemeProvider>
    </QueryClientProvider>
)
