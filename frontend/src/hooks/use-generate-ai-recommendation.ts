/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface GenerateRecommendationParams {
    criticalEmpId: number;
}

const useGenerateAIRecommendation = () => {
    const { mutateAsync: generateRecommendation, isPending: generating } = useMutation({
        mutationFn: async ({ criticalEmpId }: GenerateRecommendationParams) => {
            const res = await api.post("admin/generate-recommendation", { criticalEmpId })
            return res.data
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to generate AI-Recommendation. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { generateRecommendation, generating }
}

export default useGenerateAIRecommendation