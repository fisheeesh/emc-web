import CommonFilter from "@/components/shared/common-filter";
import LocalSearch from "@/components/shared/local-search";
import TableSkeleton from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRIORITY, RSTATUS, RType, TSFILTER } from "@/lib/constants";
// import DetailsModal from "../../modals/details-modal";
import { formatId } from "@/lib/utils";

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
    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl">Requested Actions</CardTitle>
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
                                                    <span className="whitespace-nowrap">{formatId(action.id)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{action.department.name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{"HI"}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{action.priority}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{action.type}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap">{action.status}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="whitespace-nowrap font-en">{action.dueDate}</span>
                                                </TableCell>
                                                <TableCell className="space-x-2 text-center">
                                                    {/* Details Dialog */}
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant='outline' className="cursor-pointer">
                                                                Details
                                                            </Button>
                                                        </DialogTrigger>
                                                        {/* <DetailsModal employee={emp} /> */}
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