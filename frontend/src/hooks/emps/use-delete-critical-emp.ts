/* eslint-disable @typescript-eslint/no-explicit-any */
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
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete critical employee. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { deleteCriticalEmp, deletingCriticalEmp }
}

export default useDeleteCriticalEmp