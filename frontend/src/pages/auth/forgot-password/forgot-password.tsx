import ForgetPasswordForm from "@/components/auth/forgot-password-form"
import useTitle from "@/hooks/use-title"

export default function ForgetPassword() {
    useTitle("Forget Password")
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ForgetPasswordForm />
            </div>
        </div>
    )
}
