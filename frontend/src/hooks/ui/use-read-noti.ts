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
            //? Cancel outgoing refetches to avoid race conditions
            await queryClient.cancelQueries({ queryKey: ["notifications"] })

            //? Snapshot the previous status for rollback
            const notifications = useNotiStore.getState().notifications
            const previousStatus = notifications.find(n => n.id === id)?.status

            //? Optimistically update the UI
            updateNotificationStatus(id, "READ")

            return { previousStatus }
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
        onError: (err: any, id: number, context: any) => {
            //? Revert the optimistic update on error
            if (context?.previousStatus) {
                updateNotificationStatus(id, context.previousStatus)
            } else {
                updateNotificationStatus(id, "SENT")
            }


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