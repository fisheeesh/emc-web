import { superApi } from "@/api"
import { invalidateEmpQueries } from "@/api/super-admin-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useDeleteEmp = () => {
    const { mutate: deleteEmp, isPending: deletingEmp } = useMutation({
        mutationFn: async (id: number) => {
            const res = await superApi.delete("super-admin/emps", { data: { id } })

            return res.data
        },
        onSuccess: async () => {
            await invalidateEmpQueries()
            toast.success("Success", {
                description: `Employee has been deleted successfully.`
            })
        },
        onError: (error) => {
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Something went wrong. Please try again."
            })
        }
    })

    return { deleteEmp, deletingEmp }
}

export default useDeleteEmp