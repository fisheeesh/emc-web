/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import queryClient from "@/api/query";
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

interface CreateActionPlanPayload {
    criticalEmpId: number;
    depId: number;
    contact: string,
    quickAction?: string;
    actionType: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    assignTo: string;
    dueDate: string;
    actionNotes: string;
    followUpNotes: string;
}

const useCreateActionPlan = () => {
    const { mutate: createActionPlan, isPending: creatingActionPlan } = useMutation({
        mutationFn: async (payload: CreateActionPlanPayload) => {
            const res = await superApi.post("admin/action-plans", payload)

            return res.data
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["critical", "infinite"], exact: false })
            toast.success('Success', {
                description: "Action plan submitted. Awaiting Upper Management approval."
            });
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create action plan. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { createActionPlan, creatingActionPlan }
}

export default useCreateActionPlan