/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import { invalidateEmpQueries } from "@/api/super-admin-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useEditCredentials = () => {
    const { mutate: editCredentials, isPending: editingCredentials } = useMutation({
        mutationFn: async (payload: any) => {
            const res = await superApi.patch("super-admin/emp-credentials", payload)

            return res.data
        },
        onSuccess: async () => {
            await invalidateEmpQueries()
            toast.success('Success', {
                description: "Employee's Credentials has been updated successfully.",
            });
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to edit employee's credentials. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { editCredentials, editingCredentials }
}

export default useEditCredentials