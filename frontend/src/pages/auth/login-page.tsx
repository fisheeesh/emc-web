import AuthForm from '@/components/auth/auth-form'
import { LogInSchema } from '@/lib/validators'
import Branding from '@/components/auth/branding'

export default function LoginPage() {
    return (
        <section className="flex flex-col min-h-screen global md:flex-row">
            <Branding />
            <AuthForm
                formType='LOGIN'
                schema={LogInSchema}
                defaultValues={{
                    email: 'admin@ata-it-th.com',
                    password: 'Admin1234$'
                }}
            />
        </section>
    )
}
