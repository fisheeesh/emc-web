/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import { invalidateActionPlanQueries } from "@/api/super-admin-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useDeleteActionPlan = () => {
    const { mutate: deleteActionPlan, isPending: deletingActionPlan } = useMutation({
        mutationFn: async (id: string) => {
            const res = await superApi.delete("super-admin/action-plans", { data: { id } })

            return res.data
        },
        onSuccess: async () => {
            await invalidateActionPlanQueries()
            toast.success("Success", {
                description: `Action Plan has been deleted successfully.`
            })
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete action plan. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { deleteActionPlan, deletingActionPlan }
}

export default useDeleteActionPlan