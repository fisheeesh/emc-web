/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api";
import queryClient from "@/api/query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useRefreshAIConcerns = () => {
    const { mutateAsync: refreshAIConcerns, isPending: refreshing } = useMutation({
        mutationFn: async (query: string) => {
            const res = await superApi.get(`/super-admin/top-concern-words${query}`)
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['top-concern-words'], exact: false })
            toast.success('Success', {
                description: "AI Anlysis Concrens refreshed.",
            });
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to refresh AI Analysis concrens. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { refreshAIConcerns, refreshing }
}

export default useRefreshAIConcerns