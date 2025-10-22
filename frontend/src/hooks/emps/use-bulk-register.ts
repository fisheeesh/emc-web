/* eslint-disable @typescript-eslint/no-explicit-any */
import { superApi } from "@/api"
import { invalidateEmpQueries } from "@/api/super-admin-query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

interface UploadResult {
    status: "success" | "failed";
    email: string;
    error?: string;
}

interface BulkRegisterResponse {
    message: string;
    results: UploadResult[];
    successCount: number;
    failureCount: number;
}

const useBulkRegister = () => {
    const { mutateAsync: bulkRegister, isPending: bulking } = useMutation({
        mutationFn: async (formData: FormData): Promise<BulkRegisterResponse> => {
            const res = await superApi.post("super-admin/bulk-register", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            return res.data
        },
        onSuccess: async (data) => {
            await invalidateEmpQueries()

            if (data.successCount > 0) {
                toast.success('Success', {
                    description: `${data.successCount} employee(s) have been created successfully.`,
                });
            }

            if (data.failureCount > 0) {
                toast.warning('Partial Success', {
                    description: `${data.failureCount} employee(s) failed to register.`,
                });
            }
        },
        onError: (err: any) => {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create employees. Please try again.";
            toast.error('Error', {
                description: msg,
            });
        },
    })

    return { bulkRegister, bulking }
}

export default useBulkRegister