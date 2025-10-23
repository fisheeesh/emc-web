/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import { invalidateDepQueries } from "@/api/super-admin-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useCreateDep = () => {
    const { mutate: createDep, isPending: creatingDep } = useMutation({
        mutationFn: async (payload: any) => {
            const res = await superApi.post("super-admin/departments", payload)

            return res.data
        },
        onSuccess: async () => {
            await invalidateDepQueries()
            toast.success('Success', {
                description: "Department has been created successfully.",
            });
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create department. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { createDep, creatingDep }
}

export default useCreateDep