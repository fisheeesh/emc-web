import ActionModal from "@/components/modals/action-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import DetailsModal from "@/components/modals/details-modal";
import LocalSearch from "@/components/shared/local-search";
import TableSkeleton from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IMG_URL } from "@/lib/constants";
import { getInitialName } from "@/lib/utils";
import { useState } from "react";
import { GrMoreVertical, GrNotes } from "react-icons/gr";
import { IoSparklesOutline } from "react-icons/io5";
import { RiDeleteBin5Line } from "react-icons/ri";

interface Props {
    data: CriticalEmployee[]
    status: "error" | 'success' | 'pending',
    error: Error | null,
    isFetching?: boolean,
    isFetchingNextPage: boolean,
    fetchNextPage: () => void,
    hasNextPage: boolean
}

export default function CriticalTable({ data, status, error, isFetchingNextPage, fetchNextPage, hasNextPage }: Props) {
    const [viewAnalysis, setViewAnalysis] = useState<CriticalEmployee | null>(null);
    const [viewAction, setViewAction] = useState<CriticalEmployee | null>(null);
    const [deleteCEmp, setDeleteCEmp] = useState<CriticalEmployee | null>(null);

    return (
        <Card className="rounded-md border-destructive border-2 flex flex-col gap-5">
            <CardHeader className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between">
                <div className="flex flex-col items-start gap-2 tracking-wide">
                    <CardTitle className="text-xl md:text-2xl text-destructive">Critical Mood Table</CardTitle>
                    <CardDescription>Employees whose average sentiment score lower than particular points will be shown here</CardDescription>
                </div>
                <LocalSearch filterValue="cKw" />
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold">Name</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Department</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Contact</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">EmotionScore</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Issued At</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Resolved At</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    {
                        status === 'pending' ?
                            <TableSkeleton cols={7} />
                            : status === 'error'
                                ? <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-10">
                                            Error: {error?.message}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                                :
                                <TableBody>
                                    {
                                        data.map((emp) => (
                                            <TableRow key={emp.id}>
                                                <TableCell className="py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="size-9">
                                                            <AvatarImage src={IMG_URL + emp.employee.avatar} alt={emp.employee.fullName} />
                                                            <AvatarFallback>{getInitialName(emp.employee.fullName)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="whitespace-nowrap">{emp.employee.fullName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.department.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.employee.email}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="whitespace-nowrap font-en">{emp.emotionScore}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="whitespace-nowrap font-en">{emp.createdAt}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="whitespace-nowrap font-en">{emp.resolvedAt ?? '—'}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
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
                                                                        onClick={() => setViewAnalysis(emp)}
                                                                    >
                                                                        <IoSparklesOutline className="text-black dark:text-white" />
                                                                        Analysis
                                                                    </Button>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                                    <Button
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        className="w-full cursor-pointer flex justify-start gap-2 px-1.5"
                                                                        onClick={() => setViewAction(emp)}
                                                                    >
                                                                        <GrNotes className="text-black dark:text-white" />
                                                                        Action
                                                                    </Button>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                                    <Button
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        className="w-full cursor-pointer text-red-600! flex justify-start gap-2 px-1.5"
                                                                        onClick={() => setDeleteCEmp(emp)}
                                                                    >
                                                                        <RiDeleteBin5Line className=" hover:text-red-600" />
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
                                    <Dialog open={!!viewAnalysis} onOpenChange={(o) => !o && setViewAnalysis(null)}>
                                        {viewAnalysis && <DetailsModal
                                            empName={viewAnalysis.employee.fullName}
                                            analysis={viewAnalysis.analysis}
                                            criticalEmpId={viewAnalysis.id}
                                        />}
                                    </Dialog>
                                    <Dialog open={!!viewAction} onOpenChange={(o) => !o && setViewAction(null)}>
                                        {viewAction && <ActionModal employee={{
                                            id: viewAction.id,
                                            name: viewAction.employee.fullName,
                                            department: viewAction.department.name,
                                            score: viewAction.emotionScore,
                                            contact: viewAction.employee.email
                                        }} />}
                                    </Dialog>
                                    <Dialog open={!!deleteCEmp} onOpenChange={(o) => !o && setDeleteCEmp(null)}>
                                        {deleteCEmp && <ConfirmModal
                                            title="Delete Critical Employee Information Confirmation."
                                            description={`Are you sure you want to delete this critical employee information? This action cannot be undone.`}
                                            isLoading={false}
                                            loadingLabel="Deleting..."
                                            onConfirm={() => console.log('hi')}
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