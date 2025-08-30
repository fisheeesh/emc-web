import AuthForm from '@/components/auth/authForm'
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
                    email: 'syp@ata-it-th',
                    password: '12345678'
                }}
            />
        </section>
    )
}
