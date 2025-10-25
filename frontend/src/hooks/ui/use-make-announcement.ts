/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api";
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner";

type AnnouncementPayload = {
    subject: string;
    body: string;
    attachments?: File[];
}

const useMakeAnnouncement = () => {
    const { mutate: makeAnnouncement, isPending: making } = useMutation({
        mutationFn: async (payload: AnnouncementPayload) => {
            const formData = new FormData();

            formData.append('subject', payload.subject);
            formData.append('body', payload.body);

            if (payload.attachments && payload.attachments.length > 0) {
                payload.attachments.forEach((file) => {
                    formData.append('attachments', file);
                });
            }

            const res = await api.post("/admin/make-announcement", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return res.data;
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