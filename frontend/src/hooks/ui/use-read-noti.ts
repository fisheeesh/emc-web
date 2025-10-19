/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api"
import queryClient from "@/api/query"
import useNotiStore from "@/store/noti-store"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useMarkAsRead = () => {
    const { updateNotificationStatus } = useNotiStore()

    const { mutate: markAsRead, isPending: updating } = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.patch("admin/notifications", { id })
            return res.data
        },
        onMutate: async (id: number) => {
            //? Optimistically update the UI
            updateNotificationStatus(id, "READ")
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
        onError: (err: any, id: number) => {
            //? Revert the optimistic update on error
            updateNotificationStatus(id, "SENT")

            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to mark as read. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { markAsRead, updating }
}

export default useMarkAsRead