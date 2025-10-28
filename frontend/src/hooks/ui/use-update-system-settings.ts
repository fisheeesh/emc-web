/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api";
import queryClient from "@/api/query";
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";

interface Payload {
    positiveMin: number,
    neutralMin: number,
    negativeMin: number,
    criticalMin: number,
    watchlistTrackMin: number
}

const useUpdateSystemSettings = () => {
    const { mutate: updateSystemSettings, isPending: updating } = useMutation({
        mutationFn: async (payload: Payload) => {
            const res = await superApi.patch("/super-admin/system-settings", payload)

            return res.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['system-settings'] })
            toast.success('Success', {
                description: "System settings updated successfully."
            })
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to update emotions.';
            toast.error('Error', {
                description: errorMessage
            });
        },
    })

    return { updateSystemSettings, updating }
}

export default useUpdateSystemSettings