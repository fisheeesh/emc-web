import api from "@/api"
import queryClient from "@/api/query"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

const useDeleteWatchlistEmp = () => {
    const { mutate: deleteWatchlistEmp, isPending: deletingWatchlistEmp } = useMutation({
        mutationFn: async (id: number) => {
            const res = await api.delete("admin/watchlist-emps", { data: { id } })

            return res.data
        },
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist", "infinite"], exact: false })
            toast.success("Success", {
                description: `Watchlist Employee has been deleted successfully.`
            })
        },
        onError: (error) => {
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Something went wrong. Please try again."
            })
        }
    })

    return { deleteWatchlistEmp, deletingWatchlistEmp }
}

export default useDeleteWatchlistEmp