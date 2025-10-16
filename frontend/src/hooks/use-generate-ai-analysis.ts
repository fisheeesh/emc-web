/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface GenerateAnalysisParams {
    criticalEmpId: number;
}

const useGenerateAIAnalysis = () => {
    const { mutateAsync: generateAnalysis, isPending: generating } = useMutation({
        mutationFn: async ({ criticalEmpId }: GenerateAnalysisParams) => {
            const res = await api.post("admin/ai-analysis", { criticalEmpId })
            return res.data
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to generate AI-Analysis. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { generateAnalysis, generating }
}

export default useGenerateAIAnalysis