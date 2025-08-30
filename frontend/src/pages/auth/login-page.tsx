import AuthForm from '@/components/auth/authForm'
import { LogInSchema } from '@/lib/validators'
import Branding from '@/components/branding'

export default function LoginPage() {
    return (
        <section className="flex flex-col min-h-screen global md:flex-row bg-[#F1F5F9] dark:bg-slate-950 dark:text-white">
            <Branding />
            <AuthForm
                formType='LOGIN'
                schema={LogInSchema}
                defaultValues={{
                    email: 'syp@ata-it-th',
                    password: '12345678'
                }}
            />
        </section>
    )
}
