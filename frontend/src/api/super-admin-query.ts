import { superApi } from "."

const fetchAllEmployees = async () => {
    const res = await superApi.get("super-admin/all-emp")

    return res.data
}

export const allEmployeesQuery = () => ({
    queryKey: ['all-emp'],
    queryFn: fetchAllEmployees
})