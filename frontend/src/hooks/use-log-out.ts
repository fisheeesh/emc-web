import { authApi } from "@/api"
import useUserStore from "@/store/user-store"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"

const useLogout = () => {
    const navigate = useNavigate()
    const { clearUser } = useUserStore()

    const { mutate: logoutUser, isPending: isLoading } = useMutation({
        mutationFn: async () => {
            const res = await authApi.post("logout")

            if (res.status !== 200) {
                throw new Error("Something went wrong. Please try again.")
            }

            return res.data
        },
        onSuccess: () => {
            // queryClient.removeQueries()
            clearUser()
            navigate('/login', { replace: true })
        },
        onError: (error) => {
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Something went wrong. Please try again."
            })
        }
    })

    return { logoutUser, isLoading }
}

export default useLogout