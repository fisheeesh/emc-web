import ActionModal from "@/components/modals/action-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import WathclistHistoryModal from "@/components/modals/wathlist-history-modal";
import LocalSearch from "@/components/shared/local-search";
import TableSkeleton from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useDeleteWatchlistEmp from "@/hooks/emps/use-delete-watchlist-emp";
import { getInitialName } from "@/lib/utils";
import { useState } from "react";
import { GiBinoculars } from "react-icons/gi";
import { GrMoreVertical, GrNotes } from "react-icons/gr";
import { MdHistory } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";

interface Props {
    data: WatchlistEmployee[]
    status: "error" | 'success' | 'pending',
    error: Error | null,
    isFetching?: boolean,
    isFetchingNextPage: boolean,
    fetchNextPage: () => void,
    hasNextPage: boolean
}

export default function WatchListTable({ data, status, error, isFetchingNextPage, fetchNextPage, hasNextPage }: Props) {
    const [viewAction, setViewAction] = useState<WatchlistEmployee | null>(null);
    const [viewHistory, setHistory] = useState<WatchlistEmployee | null>(null);
    const { deleteWatchlistEmp, deletingWatchlistEmp } = useDeleteWatchlistEmp()

    return (
        <Card className="rounded-md border-yellow-500 border-2 flex flex-col gap-5">
            <CardHeader className="flex flex-col md:flex-row gap-3 justify-between">
                <div className="flex flex-col items-start gap-2 tracking-wide">
                    <CardTitle className="text-xl md:text-2xl text-yellow-600 flex items-center gap-2">
                        <GiBinoculars />
                        WatchList Employees
                    </CardTitle>
                    <CardDescription className="md:line-clamp-1">Employees moved from critical status after intervention, now under ongoing observation for stability</CardDescription>
                </div>
                <LocalSearch filterValue="wKw" />
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold">Name</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Department</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Contact</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">EmotionScore</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Taken Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    {
                        status === 'pending' ?
                            <TableSkeleton cols={5} />
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
                                                            <AvatarImage src={emp.avatar} alt={emp.fullName} />
                                                            <AvatarFallback>{getInitialName(emp.fullName)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="whitespace-nowrap">{emp.fullName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{emp.department.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap font-en">{emp.email}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="whitespace-nowrap font-en">{emp.avgScore}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Dialog>
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
                                                                            onClick={() => setViewAction(emp)}
                                                                        >
                                                                            <GrNotes className="text-black dark:text-white" />
                                                                            Taken Action
                                                                        </Button>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                                        <Button
                                                                            size='icon'
                                                                            variant='ghost'
                                                                            className="w-full cursor-pointer flex justify-start gap-2 px-1.5"
                                                                            onClick={() => setHistory(emp)}
                                                                        >
                                                                            <MdHistory className="text-black dark:text-white" />
                                                                            History
                                                                        </Button>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                size='icon'
                                                                                variant='ghost'
                                                                                className="w-full cursor-pointer text-red-600! flex justify-start gap-2 px-1.5"
                                                                            >
                                                                                <RiDeleteBin5Line className="hover:text-red-600" />
                                                                                Delete
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuGroup>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <ConfirmModal
                                                            title="Delete Watchlist Employee Info Confirmation."
                                                            description={`Are you sure you want to delete this watchlist employee information? This action cannot be undone.`}
                                                            isLoading={deletingWatchlistEmp}
                                                            loadingLabel="Deleting..."
                                                            onConfirm={() => deleteWatchlistEmp(emp.id)}
                                                        />
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                    <Dialog open={!!viewAction} onOpenChange={(o) => !o && setViewAction(null)}>
                                        {viewAction && <ActionModal
                                            employee={{
                                                id: viewAction.id,
                                                name: viewAction.fullName,
                                                department: viewAction.department.name,
                                                departmentId: viewAction.department.id,
                                                score: viewAction.avgScore,
                                                contact: viewAction.email
                                            }}
                                            action={viewAction.actionPlan}
                                            onClose={() => setViewAction(null)}
                                        />}
                                    </Dialog>
                                    <Dialog open={!!viewHistory} onOpenChange={(o) => !o && setHistory(null)}>
                                        {viewHistory && <WathclistHistoryModal
                                            empName={viewHistory.fullName}
                                            emotionHistory={viewHistory.emotionHistory}
                                        />}
                                    </Dialog>
                                </TableBody>
                    }
                </Table>
                <div className="my-4 flex flex-col items-center justify-center">
                    {
                        data.length > 0 && <Button
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
                        </Button>
                    }
                </div>
                {data.length === 0 && status === 'success' && <div className="my-4 flex flex-col items-center justify-center">
                    <Empty label="No records found" classesName="w-[300px] h-[200px] " />
                </div>}
            </CardContent>
        </Card>
    )
}