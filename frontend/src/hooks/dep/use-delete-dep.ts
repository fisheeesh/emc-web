/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import { invalidateDepQueries } from "@/api/super-admin-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useDeleteDep = () => {
    const { mutate: deleteDep, isPending: deletingDep } = useMutation({
        mutationFn: async (id: number) => {
            const res = await superApi.delete("super-admin/departments", { data: { id } })

            return res.data
        },
        onSuccess: async () => {
            await invalidateDepQueries()
            toast.success("Success", {
                description: `Department has been deleted successfully.`
            })
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete department. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { deleteDep, deletingDep }
}

export default useDeleteDep