/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api";
import queryClient from "@/api/query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateEmotionCategories = () => {
    const { mutate: updateEmotionCate, isPending: updating } = useMutation({
        mutationFn: async (data: { title: string; emotions: Emotion[] }) => {
            const res = await superApi.patch('/super-admin/emotion-categories', data);

            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-emotion-categories'] });
            toast.success('Success', {
                description: 'Emotions updated successfully.'
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to update emotions';
            toast.error('Error', {
                description: errorMessage
            });
        },
    });

    return { updateEmotionCate, updating }
}

export default useUpdateEmotionCategories