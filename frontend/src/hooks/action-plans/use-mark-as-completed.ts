/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api"
import queryClient from "@/api/query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useMarkAsCompleted = () => {
    const { mutate: markAsCompleted, isPending: updatingAction } = useMutation({
        mutationFn: async (id: string) => {
            const res = await api.patch("admin/action-plans", { id })

            return res.data
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["critical", "infinite"], exact: false })
            queryClient.invalidateQueries({ queryKey: ["watchlist", "infinite"], exact: false })
            toast.success('Success', {
                description: "Action marked as completed. Thanks for your hard-working!"
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

    return { markAsCompleted, updatingAction }
}

export default useMarkAsCompleted