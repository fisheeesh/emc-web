/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api";
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";

const useMakeAnnouncement = () => {
    const { mutate: makeAnnouncement, isPending: making } = useMutation({
        mutationFn: async (payload: any) => {
            const res = await api.post("/admin/make-announcement", payload)

            return res.data
        },
        onSuccess: () => {
            toast.success("Success", {
                description: "Announcement has been made successfully."
            })
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to make announcement.';
            toast.error('Error', {
                description: errorMessage
            });
        },
    })

    return { makeAnnouncement, making }
}

export default useMakeAnnouncement