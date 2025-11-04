import ActionDetailsModal from "@/components/modals/action-details-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import CommonFilter from "@/components/shared/common-filter";
import CustomBadge from "@/components/shared/custom-badge";
import LocalSearch from "@/components/shared/local-search";
import TableSkeleton from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useDeleteActionPlan from "@/hooks/action-plans/use-delete-action-plan";
import { PRIORITY, RSTATUS, RType, TSFILTER } from "@/lib/constants";
import { formatId } from "@/lib/utils";
import moment from "moment";
import { useState } from "react";
import { FaListCheck } from "react-icons/fa6";
import { GoFileSymlinkFile } from "react-icons/go";
import { GrMoreVertical } from "react-icons/gr";
import { RiDeleteBin5Line } from "react-icons/ri";

interface Props {
    data: ActionPlan[]
    status: "error" | 'success' | 'pending',
    error: Error | null,
    isFetching?: boolean,
    isFetchingNextPage: boolean,
    fetchNextPage: () => void,
    hasNextPage: boolean
}

export default function ActionsTable({ data, status, error, isFetchingNextPage, fetchNextPage, hasNextPage }: Props) {
    const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);
    const { deleteActionPlan, deletingActionPlan } = useDeleteActionPlan()

    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                            <GoFileSymlinkFile />
                            Requested Actions
                        </CardTitle>
                        <CardDescription>
                            Review and monitor action plans submitted by department managers and HR to support employee wellbeing
                        </CardDescription>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2">
                    <LocalSearch filterValue="rKw" />
                    <CommonFilter
                        filterValue="priority"
                        filters={PRIORITY}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="rStatus"
                        filters={RSTATUS}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="rType"
                        filters={RType}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="rTs"
                        filters={TSFILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold">ID</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Department</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Victim</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Priority</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Type</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Status</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Due Date</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Resolved At</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    {
                        status === 'pending' ?
                            <TableSkeleton cols={8} />
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
                                        data.map((action) => (
                                            <TableRow key={action.id}>
                                                <TableCell className="py-6">
                                                    <span className="whitespace-nowrap font-en">{formatId(action.id)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{action.department.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{action.criticalEmployee.employee.fullName}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <CustomBadge value={action.priority} />
                                                </TableCell>
                                                <TableCell>
                                                    <CustomBadge value={action.type} />
                                                </TableCell>
                                                <TableCell>
                                                    <CustomBadge value={action.status} />
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap font-en">{moment(action.dueDate).format("LL")}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap font-en">{action.criticalEmployee.resovledAt ? moment(action.criticalEmployee.resovledAt).format("LL") : '—'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size='icon' variant='ghost' className="cursor-pointer">
                                                                    <GrMoreVertical className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-35" align="end" forceMount>
                                                                <DropdownMenuGroup>
                                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                                        <Button
                                                                            size='icon'
                                                                            variant='ghost'
                                                                            className="w-full cursor-pointer flex justify-start gap-2 px-1.5"
                                                                            onClick={() => setEditingPlan(action)}
                                                                        >
                                                                            <FaListCheck className="text-black dark:text-white" />
                                                                            Check Details
                                                                        </Button>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                                        <DialogTrigger asChild>
                                                                            <Button
                                                                                size='icon'
                                                                                variant='ghost'
                                                                                className="w-full cursor-pointer flex text-red-600! justify-start gap-2 px-1.5"
                                                                            >
                                                                                <RiDeleteBin5Line className="text-red-600" />
                                                                                Delete
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuGroup>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                        <ConfirmModal
                                                            title="Delete Action Plan Confirmation."
                                                            description={`Are you sure you want to delete this action plan? This action cannot be undone.`}
                                                            isLoading={deletingActionPlan}
                                                            loadingLabel="Deleting..."
                                                            onConfirm={() => deleteActionPlan(action.id)}
                                                        />
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                    <Dialog open={!!editingPlan} onOpenChange={(o) => !o && setEditingPlan(null)}>
                                        {editingPlan && <ActionDetailsModal
                                            action={editingPlan}
                                            onClose={() => setEditingPlan(null)}
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