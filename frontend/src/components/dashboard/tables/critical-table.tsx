import LocalSearch from "@/components/shared/local-search";
import TableSkeleton from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IMG_URL } from "@/lib/constants";
import { getInitialName } from "@/lib/utils";
// import ActionModal from "../../modals/action-modal";
// import DetailsModal from "../../modals/details-modal";

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
                            <TableHead className="whitespace-nowrap text-center font-semibold">Resolved At</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Actions</TableHead>
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

                                                    {/* Action Dialog */}
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button className="cursor-pointer bg-brand hover:bg-blue-600 text-white">
                                                                Action
                                                            </Button>
                                                        </DialogTrigger>
                                                        {/* <ActionModal employee={emp} /> */}
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