import { superApi } from "@/api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useDeleteActionPlan = () => {
    const { mutate: deleteActionPlan, isPending: deletingActionPlan } = useMutation({
        mutationFn: async (id: string) => {
            const res = await superApi.delete("super-admin/action-plans", { data: { id } })

            return res.data
        },
        onSuccess: async () => {
            toast.success("Success", {
                description: `Action Plan has been deleted successfully.`
            })
        },
        onError: (error) => {
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Something went wrong. Please try again."
            })
        }
    })

    return { deleteActionPlan, deletingActionPlan }
}

export default useDeleteActionPlan