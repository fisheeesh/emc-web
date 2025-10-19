/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface RegenerateAnalysisParams {
    criticalEmpId: number;
}

const useRegenerateAIAnalysis = () => {
    const { mutateAsync: regenerateAnalysis, isPending: regenerating } = useMutation({
        mutationFn: async ({ criticalEmpId }: RegenerateAnalysisParams) => {
            const res = await api.post("admin/regenerate-ai-analysis", { criticalEmpId })
            return res.data
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to regenerate AI-Analysis. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { regenerateAnalysis, regenerating }
}

export default useRegenerateAIAnalysis