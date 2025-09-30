import ConfirmModal from "@/components/modals/confirm-modal";
import CreateEditEmpModal from "@/components/modals/create-edit-emp-modal";
import CommonFilter from "@/components/shared/common-filter";
import CustomBadge from "@/components/shared/custom-badge";
import LocalSearch from "@/components/shared/local-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ACC_FILTER, EMOTION_FILTER, IMG_URL, JOBS_FILTER, ROLES_FILTER, TSFILTER } from "@/lib/constants";
import { getInitialName } from "@/lib/utils";
import { IoPersonAdd } from "react-icons/io5";

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

    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">Employee Lists under ATA - IT Company</CardTitle>
                        <CardDescription>Create, Update, and Delete employees</CardDescription>
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 font-semibold hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition-colors duration-300 w-fit min-h-[44px] text-white flex items-center gap-2 cursor-pointer">
                                    <IoPersonAdd /> Create a new employee
                                </Button>
                            </DialogTrigger>
                            <CreateEditEmpModal />
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
                            <TableHead className="whitespace-nowrap">Name</TableHead>
                            <TableHead className="whitespace-nowrap">Position</TableHead>
                            <TableHead className="whitespace-nowrap">Email</TableHead>
                            <TableHead className="whitespace-nowrap">Department</TableHead>
                            <TableHead className="whitespace-nowrap">Role</TableHead>
                            <TableHead className="whitespace-nowrap">Job Type</TableHead>
                            <TableHead className="whitespace-nowrap">Overall</TableHead>
                            <TableHead className="whitespace-nowrap">Last Critical Time</TableHead>
                            <TableHead className="whitespace-nowrap">Joined At</TableHead>
                            <TableHead className="whitespace-nowrap text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    {
                        status === 'pending' ?
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-10">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            </TableBody>
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
                                                    <CustomBadge status={emp.status as "positive" | "neutral" | "negative" | "critical"} />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.lastCritical ?? "NULL"}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap font-en">{emp.createdAt}</span>
                                                </TableCell>
                                                <TableCell className="space-x-2 text-center">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant='outline' className="cursor-pointer">
                                                                Edit
                                                            </Button>
                                                        </DialogTrigger>
                                                        <CreateEditEmpModal />
                                                    </Dialog>

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className="cursor-pointer" variant='destructive'>
                                                                Delete
                                                            </Button>
                                                        </DialogTrigger>
                                                        <ConfirmModal />
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
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
