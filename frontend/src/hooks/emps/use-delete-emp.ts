/* eslint-disable @typescript-eslint/no-explicit-any */
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
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete employee. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { deleteEmp, deletingEmp }
}

export default useDeleteEmp