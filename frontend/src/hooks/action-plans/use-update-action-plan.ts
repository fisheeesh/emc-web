/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

interface UpdateActionPlanPayload {
    id: string,
    suggestions: string,
    status: string,
    emailType: string
}

const useUpdateActionPlan = () => {
    const { mutate: updateActionPlan, isPending: updatingAction } = useMutation({
        mutationFn: async (payload: UpdateActionPlanPayload) => {
            const res = await superApi.patch("super-admin/action-plans", payload)

            return res.data
        },
        onSuccess: async () => {
            toast.success('Success', {
                description: "Saved changes and send back to responsible HR"
            });
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to save changes. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { updateActionPlan, updatingAction }
}

export default useUpdateActionPlan