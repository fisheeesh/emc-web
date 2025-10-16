import ConfirmModal from "@/components/modals/confirm-modal";
import CreateEditEmpModal from "@/components/modals/create-edit-emp-modal";
import EmpDetailsModal from "@/components/modals/emp-details-modal";
import CommonFilter from "@/components/shared/common-filter";
import CustomBadge from "@/components/shared/custom-badge";
import LocalSearch from "@/components/shared/local-search";
import TableSkeleton from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useDeleteEmp from "@/hooks/use-delete-emp";
import { ACC_FILTER, EMOTION_FILTER, IMG_URL, JOBS_FILTER, ROLES_FILTER, TSFILTER } from "@/lib/constants";
import { getInitialName } from "@/lib/utils";
import { createEmpSchema, updateEmpSchema } from "@/lib/validators";
import { useState } from "react";
import { BsEye } from "react-icons/bs";
import { GrMoreVertical } from "react-icons/gr";
import { IoPersonAdd } from "react-icons/io5";
import { LuUserPen } from "react-icons/lu";
import { RiDeleteBin5Line } from "react-icons/ri";

interface Props {
    data: Employee[]
    status: "error" | 'success' | 'pending',
    error: Error | null,
    isFetching?: boolean,
    isFetchingNextPage: boolean,
    fetchNextPage: () => void,
    hasNextPage: boolean
}

export default function EmpTables({ data, status, error, isFetchingNextPage, fetchNextPage, hasNextPage }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
    const [viewEmp, setViewEmp] = useState<Employee | null>(null);
    const [delEmp, setDelEmp] = useState<Employee | null>(null);
    const { deleteEmp, deletingEmp } = useDeleteEmp()

    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">Employee Lists under ATA - IT Company</CardTitle>
                        <CardDescription>Create, Update, and Delete employees</CardDescription>
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 font-semibold hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition-colors duration-300 w-fit min-h-[44px] text-white flex items-center gap-2 cursor-pointer">
                                    <IoPersonAdd /> Create a new employee
                                </Button>
                            </DialogTrigger>
                            {createOpen && <CreateEditEmpModal
                                formType="CREATE"
                                schema={createEmpSchema}
                                defaultValues={{
                                    firstName: "",
                                    lastName: "",
                                    email: "",
                                    password: "",
                                    phone: "",
                                    department: "",
                                    position: "",
                                    role: "EMPLOYEE",
                                    jobType: "FULLTIME",
                                    avatar: undefined,
                                }}
                                onClose={() => setCreateOpen(false)}
                            />}
                        </Dialog>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2">
                    <LocalSearch filterValue="kw" />
                    <CommonFilter
                        filterValue="role"
                        filters={ROLES_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="jobType"
                        filters={JOBS_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="accType"
                        filters={ACC_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="status"
                        filters={EMOTION_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="ts"
                        filters={TSFILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold">Name</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Position</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Email</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Department</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Role</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Job Type</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Acc. Type</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Overall</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Last Critical Time</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Joined At</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    {
                        status === 'pending' ?
                            <TableSkeleton cols={11} />
                            : status === 'error'
                                ? <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-10">
                                            Error: {error?.message}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                                : <TableBody>
                                    {
                                        data.map((emp) => (
                                            <TableRow key={emp.id} className="py-10">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="size-9">
                                                            <AvatarImage src={IMG_URL + emp.avatar} alt={emp.fullName} />
                                                            <AvatarFallback>{getInitialName(emp.fullName)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="whitespace-nowrap">{emp.fullName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <span className="whitespace-nowrap">{emp.position}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.email}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.department.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.role}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.jobType}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.accType}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <CustomBadge status={emp.status as "positive" | "neutral" | "negative" | "critical"} />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.lastCritical ?? "NULL"}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap font-en">{emp.createdAt}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size='icon' variant='ghost' className="cursor-pointer">
                                                                <GrMoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-30" align="end" forceMount>
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                                    <Button
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        className="w-full cursor-pointer flex justify-start gap-2 px-1.5"
                                                                        onClick={() => setViewEmp(emp)}
                                                                    >
                                                                        <BsEye className="text-black dark:text-white" />
                                                                        View Details
                                                                    </Button>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                                    <Button
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        className="w-full cursor-pointer flex justify-start gap-2 px-1.5"
                                                                        onClick={() => setEditingEmp(emp)}
                                                                    >
                                                                        <LuUserPen className="text-black dark:text-white" />
                                                                        Edit
                                                                    </Button>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                                    <Button
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        className="w-full cursor-pointer flex text-red-600 justify-start gap-2 px-1.5"
                                                                        onClick={() => setDelEmp(emp)}
                                                                    >
                                                                        <RiDeleteBin5Line className="text-red-600" />
                                                                        Delete
                                                                    </Button>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                    <Dialog open={!!editingEmp} onOpenChange={(o) => !o && setEditingEmp(null)}>
                                        {editingEmp && <CreateEditEmpModal
                                            formType="EDIT"
                                            userId={editingEmp.id}
                                            schema={updateEmpSchema}
                                            defaultValues={{
                                                firstName: editingEmp.firstName,
                                                lastName: editingEmp.lastName,
                                                phone: editingEmp.phone,
                                                department: editingEmp.department.name,
                                                position: editingEmp.position,
                                                role: editingEmp.role as "EMPLOYEE" | "ADMIN" | "SUPERADMIN",
                                                jobType: editingEmp.jobType as "FULLTIME" | "PARTTIME" | "CONTRACT" | "INTERNSHIP",
                                                accType: editingEmp.accType as "ACTIVE" | "FREEZE",
                                                avatar: undefined,
                                            }}
                                            onClose={() => setEditingEmp(null)}
                                        />}
                                    </Dialog>
                                    <Dialog open={!!viewEmp} onOpenChange={(o) => !o && setViewEmp(null)}>
                                        {viewEmp && <EmpDetailsModal />}
                                    </Dialog>
                                    <Dialog open={!!delEmp} onOpenChange={(o) => !o && setDelEmp(null)}>
                                        {delEmp && <ConfirmModal
                                            title="Delete Employee Confirmation."
                                            description={`Are you sure you want to delete this employee? This action cannot be undone.`}
                                            isLoading={deletingEmp}
                                            loadingLabel="Deleting..."
                                            onConfirm={() => deleteEmp(delEmp.id)}
                                        />}
                                    </Dialog>
                                </TableBody>
                    }
                </Table>
                <div className="my-4 flex flex-col items-center justify-center">
                    {data.length > 0 && <Button
                        className="cursor-pointer"
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                        variant={!hasNextPage ? "ghost" : "secondary"}
                    >
                        {isFetchingNextPage
                            ? "Loading more..."
                            : hasNextPage
                                ? "Load More"
                                : "Nothing more to load"}
                    </Button>}
                </div>

                {data.length === 0 && status === 'success' && <div className="my-4 flex flex-col items-center justify-center">
                    <Empty label="No records found" classesName="w-[300px] h-[200px] " />
                </div>}
            </CardContent>
        </Card>
    )
}
