import api from "@/api"
import queryClient from "@/api/query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useDeleteCriticalEmp = () => {
    const { mutate: deleteCriticalEmp, isPending: deletingCriticalEmp } = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete("admin/critical-emps", { data: { id } })

            return res.data
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["critical", "infinite"], exact: false })
            toast.success("Success", {
                description: `Critical Employee has been deleted successfully.`
            })
        },
        onError: (error) => {
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Something went wrong. Please try again."
            })
        }
    })

    return { deleteCriticalEmp, deletingCriticalEmp }
}

export default useDeleteCriticalEmp