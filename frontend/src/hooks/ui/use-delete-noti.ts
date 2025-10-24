/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api"
import queryClient from "@/api/query"
import useNotiStore from "@/store/noti-store"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useDeleteNoti = () => {
    const { deleteNotification, setNotis } = useNotiStore()

    const { mutate: deleteNoti, isPending: deleting } = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete("admin/notifications", { data: { id } })
            return res.data
        },
        onMutate: async (id: number) => {
            //? Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["notifications"] })

            //? Snapshot the previous value
            const previousNotifications = queryClient.getQueryData(["notifications"])
            const previousZustandNotis = useNotiStore.getState().notifications

            //? Optimistically update the UI
            deleteNotification(id)

            return { previousNotifications, previousZustandNotis }
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] })
        },
        onError: (err: any, context: any) => {
            //? Revert the optimistic update on error
            if (context?.previousNotifications) {
                queryClient.setQueryData(["notifications"], context.previousNotifications)
            }

            if (context?.previousZustandNotis) {
                setNotis(context.previousZustandNotis)
            }

            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete notification. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { deleteNoti, deleting }
}

export default useDeleteNoti