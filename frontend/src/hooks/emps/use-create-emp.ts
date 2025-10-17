/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import { invalidateEmpQueries } from "@/api/super-admin-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useCreateEmp = () => {
    const { mutate: createEmp, isPending: creatingEmp } = useMutation({
        mutationFn: async (payload: any) => {
            const res = await superApi.post("super-admin/emps", payload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            return res.data
        },
        onSuccess: async () => {
            await invalidateEmpQueries()
            toast.success('Success', {
                description: "Employee has been created successfully.",
            });
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create employee. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { createEmp, creatingEmp }
}

export default useCreateEmp