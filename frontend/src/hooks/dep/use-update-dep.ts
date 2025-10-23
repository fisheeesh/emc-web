/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import { invalidateDepQueries } from "@/api/super-admin-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useUpdateDep = () => {
    const { mutate: updateDep, isPending: updatingDep } = useMutation({
        mutationFn: async (payload: any) => {
            const res = await superApi.patch("super-admin/departments", payload)

            return res.data
        },
        onSuccess: async () => {
            await invalidateDepQueries()
            toast.success('Success', {
                description: "Department has been updated successfully"
            });
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update department. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { updateDep, updatingDep }
}

export default useUpdateDep